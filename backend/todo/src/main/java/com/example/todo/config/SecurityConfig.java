package com.example.todo.config;

import com.example.todo.filter.JWTFilter;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration; 
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; 
import org.springframework.web.filter.CorsFilter; 
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Add the cors() configuration here.
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            .csrf(csrf -> csrf.disable())
            
            .authorizeHttpRequests(auth -> auth
                // Explicitly permit all OPTIONS requests. This is crucial for preflight.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Keep your existing public endpoints
                .requestMatchers("/user/login", "/user/register").permitAll()
                
                // Task Execution Health endpoints - organizational metrics (no individual performance data)
                .requestMatchers("/api/health/**").permitAll()
                
                .requestMatchers("/api/assistant/**").permitAll()

                .requestMatchers("/api/gemini/**").permitAll()
                
                .requestMatchers("/meeting/**").permitAll()
                
                .anyRequest().authenticated()
            )

            
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Add this Bean to configure CORS globally.
   @Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowCredentials(true);
    configuration.setAllowedOrigins(List.of("http://10.244.3.142:3000","http://10.244.3.142:3001", "http://10.244.2.97:3000", "http://10.244.2.97:3001", "http://localhost:3000"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); 
    source.registerCorsConfiguration("/**", configuration);

    return source;
}
}


// package com.example.todo.Config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.web.cors.CorsConfiguration;
// import java.util.List;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             // 1. Disable CSRF (Required for POST requests to work)
//             .csrf(csrf -> csrf.disable())
            
//             // 2. Configure CORS so your Frontend (3000) can talk to Backend (8080)
//             .cors(cors -> cors.configurationSource(request -> {
//                 CorsConfiguration config = new CorsConfiguration();
//                 config.setAllowedOrigins(List.of("http://localhost:3000"));
//                 config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//                 config.setAllowedHeaders(List.of("*"));
//                 return config;
//             }))

//             // 3. Allow all requests to your Gemini endpoint without authentication
//             .authorizeHttpRequests(auth -> auth
//                 .requestMatchers("/api/gemini/**").permitAll() 
//                 .anyRequest().authenticated()
//             )

//             // 4. Disable the default login popups/forms
//             .httpBasic(basic -> basic.disable())
//             .formLogin(form -> form.disable());

//         return http.build();
//     }
// }