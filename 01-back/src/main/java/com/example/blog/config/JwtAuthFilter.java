package com.example.blog.config;

// 💡 --- IMPORT THESE ---
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import com.example.blog.service.CustomUserDetailsService; // 💡 Or your UserDetailsService
// 💡 --- END IMPORTS ---
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;
    private final CustomUserDetailsService userDetailsService; // 💡 INJECT THIS

    // 💡 UPDATE CONSTRUCTOR
    public JwtAuthFilter(JwtUtil jwtUtil, TokenBlacklist tokenBlacklist, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklist = tokenBlacklist;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 💡 Allow auth-related paths to pass through without checks
        String path = request.getServletPath();
        if (path.equals("/auth/login") || path.equals("/auth/register") || path.equals("/auth/logout")) {
            filterChain.doFilter(request, response);
            return; 
        }

        String token = null;
        if (request.getCookies() != null) {
        System.out.println("COOKIES NOT NULL");

            for (Cookie cookie : request.getCookies()) {
                System.out.println("COOKIES LOOPED");
                if ("jwt".equals(cookie.getName())) {
                    System.out.println("JWT COOKIE NAME FOUNDED");
                    token = cookie.getValue();
                    System.out.println("COOKIES VALUE : "+token);
                    break;
                }
            }
        }
                    System.out.println("COOKIES VALUE 2 : "+token);

        // If no token, continue chain (Spring Security will block if needed)
        if (token == null) {
        System.out.println("TOKEN NULL");
            filterChain.doFilter(request, response);
            return;
        }

        if (tokenBlacklist.isBlacklisted(token)) {
        System.out.println("TOKEN BLACKLISTED");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String username = null; 
        try {
            username = jwtUtil.validateToken(token);
            if (username == null ){
            System.out.println("USERNAMETOKEN NULL");

            }
        } catch (Exception e) {
            // Invalid token
        System.out.println("TOKEN EXCEPTION");

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details from the username in the token
        System.out.println("YES SECURITYCONTEXT");

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Create an authentication token
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // We don't have credentials
                    userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("User Authenticated: " + username);
            request.setAttribute("userName", username);
        }else {

            System.out.println("NO SECURITYCONTEXT");
        }

        filterChain.doFilter(request, response);
    }
}