package com.example.todo;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="admin_google_auth")
public class AdminGoogleAuthEntity {
    
    @Id
    private String adminId;
    private String refreshToken;
    private String gmail;
    private boolean isConnected;

    public String getAdminId() {
        return adminId;
    }
    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public String getGmail() {
        return gmail;
    }
    public void setGmail(String gmail) {
        this.gmail = gmail;
    }
    public boolean isConnected() {
        return isConnected;
    }
    public void setConnected(boolean isConnected) {
        this.isConnected = isConnected;
    }

}
