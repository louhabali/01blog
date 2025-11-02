package com.example.blog.config;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;
    //init jwr
    public JwtAuthFilter(JwtUtil jwtUtil,TokenBlacklist tokenBlacklist) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklist = tokenBlacklist;
    }
  
    @Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
            if (request.getServletPath().equals("/auth/logout")) {
        filterChain.doFilter(request, response);
        return; // Don't do any validation below
    }
    if (request.getCookies() != null) {
        for (Cookie cookie : request.getCookies()) {
            if ("jwt".equals(cookie.getName())) {
                String token = cookie.getValue();
                if (tokenBlacklist.isBlacklisted(token)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                       ResponseCookie c = ResponseCookie.from("jwt", "")
                            .httpOnly(true)
                            .path("/")
                            .maxAge(0)
                            .build();
                    response.addHeader("Set-Cookie", c.toString());
                    return;
                }




                try {
                    String email = jwtUtil.validateToken(token);
                    // print email if token is valid
                    System.out.println("THE EMAIL : "+ email);
                    request.setAttribute("userName", email);

                } catch (Exception e) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
        }
    }

    filterChain.doFilter(request, response);
}

}
