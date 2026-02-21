package com.hardytec.venera.auth.adapters.web;


import com.hardytec.venera.task.application.TaskNotFoundException;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler
{
    @ExceptionHandler({ RequestNotPermitted.class })
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public void requestNotPermitted() {
    }

    @ExceptionHandler({ TaskNotFoundException.class })
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void taskNotFound() {
    }
}


