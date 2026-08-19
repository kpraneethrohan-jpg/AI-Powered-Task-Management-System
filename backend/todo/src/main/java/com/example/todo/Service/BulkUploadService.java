package com.example.todo.Service;

import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.todo.Profile;
import com.example.todo.UserAuthentication;
import com.example.todo.Repository.UserRepository;
import com.example.todo.dto.UploadResult;

@Service
public class BulkUploadService {

    @Autowired
    private UserRepository userRepository;

    // Define the strictly allowed roles in lowercase
    private static final Set<String> VALID_ROLES = new HashSet<>(Arrays.asList("admin", "manager", "employee"));

    public UploadResult processExcel(MultipartFile file) {
        UploadResult result = new UploadResult();
        List<UploadResult.RowError> errors = new ArrayList<>();
        int successCount = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);

            if (headerRow == null) throw new RuntimeException("Excel file is empty");

            Map<String, Integer> columnMap = new HashMap<>();
            for (Cell cell : headerRow) {
                String headerName = cell.getStringCellValue().toLowerCase().trim().replace(" ", "");
                columnMap.put(headerName, cell.getColumnIndex());
            }

            String[] mandatoryFields = {"userid", "username", "role", "password", "email", "phonenumber"};
            for (String field : mandatoryFields) {
                if (!columnMap.containsKey(field)) throw new RuntimeException("Required column missing: " + field);
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                Map<String, String> rowData = new HashMap<>();
                List<String> missingFields = new ArrayList<>();

                // 1. Mandatory Check
                for (String field : mandatoryFields) {
                    String value = getCellValueAsString(row.getCell(columnMap.get(field)));
                    if (value == null || value.trim().isEmpty()) {
                        missingFields.add(field);
                    } else {
                        rowData.put(field, value.trim());
                    }
                }

                String currentUserId = rowData.getOrDefault("userid", "Row " + (i + 1));

                if (!missingFields.isEmpty()) {
                    errors.add(new UploadResult.RowError(i + 1, currentUserId, "Missing values: " + String.join(", ", missingFields)));
                    continue;
                }

                // 2. Strict Role Validation
                String rawRole = rowData.get("role").toLowerCase(); // Convert to lowercase
                if (!VALID_ROLES.contains(rawRole)) {
                    errors.add(new UploadResult.RowError(i + 1, currentUserId, 
                        "Invalid Role: '" + rowData.get("role") + "'. Allowed roles are: admin, manager, employee"));
                    continue;
                }

                // 3. Duplicate ID Check
                if (userRepository.existsById(rowData.get("userid"))) {
                    errors.add(new UploadResult.RowError(i + 1, rowData.get("userid"), "Duplicate ID: User already exists"));
                    continue;
                }

                // 4. Save to Database
                try {
                    UserAuthentication user = new UserAuthentication();
                    user.setId(rowData.get("userid"));
                    user.setUsername(rowData.get("username"));
                    user.setPassword(rowData.get("password"));
                    user.setRole(rawRole); // Save the lowercase version

                    Profile profile = new Profile();
                    profile.setEmail(rowData.get("email"));
                    profile.setPhone(rowData.get("phonenumber"));
                    user.setProfile(profile);

                    userRepository.save(user);
                    successCount++;
                } catch (Exception e) {
                    errors.add(new UploadResult.RowError(i + 1, currentUserId, "Database error: " + e.getMessage()));
                }
            }

            result.setSuccessCount(successCount);
            result.setFailureCount(errors.size());
            result.setErrors(errors);

        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage());
        }
        return result;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return new DataFormatter().formatCellValue(cell);
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }
}