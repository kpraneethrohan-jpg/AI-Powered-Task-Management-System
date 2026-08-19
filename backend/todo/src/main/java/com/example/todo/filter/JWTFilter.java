package com.example.todo.filter;

import com.example.todo.util.JWTUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import java.io.IOException;
import java.util.List;

@Component
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {

            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String token = authHeader.substring(7);

            String userId = null;

            try {
                userId = jwtUtil.extractUserId(token);
            } catch (Exception e) {
                System.out.println("JWT ERROR: " + e.getMessage());
            }
            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                if (jwtUtil.validateToken(token, userId)) {

                    String role = jwtUtil.extractRole(token);

                    List<SimpleGrantedAuthority> authorities = List
                            .of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userId,
                            null, authorities);

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (ExpiredJwtException e) {

            System.out.println("JWT Token Expired: " + e.getMessage());

        } catch (JwtException e) {

            System.out.println("Invalid JWT Token: " + e.getMessage());

        } catch (Exception e) {

            System.out.println("JWT Authentication Error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}