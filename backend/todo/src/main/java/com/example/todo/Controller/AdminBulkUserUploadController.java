package com.example.todo.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.todo.Service.BulkUploadService;
import com.example.todo.dto.UploadResult;

@RestController
@RequestMapping("/admin")
public class AdminBulkUserUploadController {

    @Autowired
    private BulkUploadService bulkUploadService;

    @PostMapping("/bulk-upload-users")
public ResponseEntity<?> uploadUsers(@RequestParam("file") MultipartFile file) {
    try {
        UploadResult result = bulkUploadService.processExcel(file);
        return ResponseEntity.ok(result);
    } catch (RuntimeException e) {
        // Return the specific error message (e.g., "Required column missing: userid") 
        // with a 400 Bad Request status
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
}