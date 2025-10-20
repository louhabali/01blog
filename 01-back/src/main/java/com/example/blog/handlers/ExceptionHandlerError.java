package com.example.blog.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import java.util.*;

@ControllerAdvice
public class ExceptionHandlerError {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Object> handle404(NoHandlerFoundException ex) {
        return new ResponseEntity<>(
                Map.of("error", "API endpoint not found"),
                HttpStatus.NOT_FOUND
        );
    }
}
