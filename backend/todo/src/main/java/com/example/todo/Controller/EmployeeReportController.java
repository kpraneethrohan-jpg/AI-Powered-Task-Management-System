package com.example.todo.Controller;

import com.example.todo.Service.EmployeeReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/admin/reports")
public class EmployeeReportController {

    @Autowired
    private EmployeeReportService employeeReportService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<byte[]> downloadEmployeeReport(@PathVariable String employeeId) {

        byte[] pdfBytes = employeeReportService.generateEmployeeReportPdf(employeeId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);

        headers.setContentDisposition(
                ContentDisposition.attachment()
                        .filename("Employee_Report_" + employeeId + ".pdf")
                        .build()
        );

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}