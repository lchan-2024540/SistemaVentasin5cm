package com.lchan.SistemaVentas.Entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ventas")
public class Ventas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_venta")
    private Integer codigoVenta;

    @Column(name = "fecha_venta")
    private LocalDate fechaVenta;

    @Column(name = "total")
    private BigDecimal total;

    @Column(name = "estado")
    private Integer estado;

    @ManyToOne
    @JoinColumn(name = "clientes_dpi_cliente")
    private Clientes cliente;

    @ManyToOne
    @JoinColumn(name = "usuarios_codigo_usuario")
    private Usuarios usuario;

    public Integer getCodigoVenta() { return codigoVenta; }
    public void setCodigoVenta(Integer codigoVenta) { this.codigoVenta = codigoVenta; }

    public LocalDate getFechaVenta() { return fechaVenta; }
    public void setFechaVenta(LocalDate fechaVenta) { this.fechaVenta = fechaVenta; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public Integer getEstado() { return estado; }
    public void setEstado(Integer estado) { this.estado = estado; }

    public Clientes getCliente() { return cliente; }
    public void setCliente(Clientes cliente) { this.cliente = cliente; }

    public Usuarios getUsuario() { return usuario; }
    public void setUsuario(Usuarios usuario) { this.usuario = usuario; }
}