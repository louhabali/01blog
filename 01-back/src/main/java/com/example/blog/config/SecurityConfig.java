package com.example.blog.config;

// --- Imports ---
import com.example.blog.service.CustomUserDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.function.Supplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// --- Configuration Class ---
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtAuthFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

   // Primary Security Filter Chain
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // 2 - Disable CSRF (for APIs using JWT)
        // Since my cookie is on sameSite=Lax, CSRF risk is minimal
        .csrf(csrf -> csrf.disable())

        // 1️ - Enable and configure CORS before anything else
        //    This ensures cross-domain requests (like from Angular 4200) are allowed
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))

        // 4- Authorization configuration
        //    Decides which routes are public and which need authentication/roles
        .authorizeHttpRequests(auth -> auth
            // Only users with role ADMIN can access /admin/**
            .requestMatchers("/admin/**").hasRole("ADMIN")

            // Public endpoints (login, logout, register)
            .requestMatchers("/auth/logout", "/auth/login", "/auth/register").permitAll()

            // Notifications endpoint requires authentication
            .requestMatchers(HttpMethod.GET, "/api/notifications/{id}").authenticated()

            // Public GET requests (home, posts, etc.)
            .requestMatchers(HttpMethod.GET, "/**").permitAll()

            // Allow preflight (OPTIONS) requests (important for CORS)
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // Everything else must be authenticated
            .anyRequest().authenticated()
        )

        // 3️ - Add the JWT authentication filter
        //    Runs BEFORE UsernamePasswordAuthenticationFilter (which runs only for form logins /POST /login)
        //    Checks for token in the request header and sets Authentication if valid 
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);


    // 5️ - Finally, build and return the filter chain for Spring Security to use
    return http.build();
}


    // --- Other Beans ---
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // --- Private Inner Class for CSRF ---
    private static final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {
        private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
            /*
             * Always load the CSRF token from the repository to ensure it is available
             * for Angular to read and send back in a header.
             */
            this.delegate.handle(request, response, csrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            /*
             * If the request contains a header (e.g., X-XSRF-TOKEN), use it.
             * Otherwise, fall back to the request parameter (e.g., _csrf).
             */
            if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
                return request.getHeader(csrfToken.getHeaderName());
            }
            return this.delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }
}