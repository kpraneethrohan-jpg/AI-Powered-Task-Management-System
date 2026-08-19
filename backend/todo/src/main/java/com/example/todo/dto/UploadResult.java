package com.example.todo.dto;

import java.util.List;
public class UploadResult {
    private int successCount;
    private int failureCount;
    private List<RowError> errors;

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<RowError> getErrors() {
        return errors;
    }

    public void setErrors(List<RowError> errors) {
        this.errors = errors;
    }

    public static class RowError {
        private int rowNumber;
        private String userId;
        private String reason;

        public RowError(int rowNumber, String userId, String reason) {
            this.rowNumber = rowNumber;
            this.userId = userId;
            this.reason = reason;
        }

        public int getRowNumber() {
            return rowNumber;
        }

        public void setRowNumber(int rowNumber) {
            this.rowNumber = rowNumber;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
