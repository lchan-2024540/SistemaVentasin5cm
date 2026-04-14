package com.lchan.SistemaVentas.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/clientes")
    public String clientes() {
        return "clientes";
    }

    @GetMapping("/productos")
    public String productos() {
        return "productos";
    }

    @GetMapping("/ventas")
    public String ventas() {
        return "ventas";
    }

    @GetMapping("/detalle-venta")
    public String detalleVenta() {
        return "detalle-venta";
    }

    @GetMapping("/usuarios")
    public String usuarios() {
        return "usuarios";
    }
}