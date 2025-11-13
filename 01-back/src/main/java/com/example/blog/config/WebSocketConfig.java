package com.example.blog.config;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;

import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import com.example.blog.repository.UserRepository;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final UserRepository userRepository;

    public WebSocketConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // where clients will subscribe
        config.setApplicationDestinationPrefixes("/app"); // where clients send
        config.setUserDestinationPrefix("/user"); // prefix for user-specific messages
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request,
                                                    WebSocketHandler wsHandler, Map<String, Object> attributes) {

                        System.out.println("Handshake request headers: " + request.getHeaders());

                        if (request instanceof ServletServerHttpRequest servletRequest) {
                            
                            // 1. Safely get the attribute from the request
                            Object userNameAttribute = servletRequest.getServletRequest().getAttribute("userName");

                            if (userNameAttribute != null) {
                                String username = userNameAttribute.toString();

                                return userRepository.findByUsername(username) // Returns Optional<User>
                                    .map(user -> (Principal) user::getUsername) // Map User to a Principal
                                    .orElse(null); // Return null if user not found
                            }
                        }
                        // 3. Return null if not a ServletServerHttpRequest or attribute is missing
                        return null;
                    }
                })
                // Set allowed origins *once* and *before* withSockJS()
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

}
