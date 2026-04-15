package com.lchan.SistemaVentas.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo_usuario")
    private Integer codigoUsuario;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "rol")
    private String rol;

    @Column(name = "estado")
    private Integer estado;

    @Lob
    @Column(name = "foto_perfil", columnDefinition = "LONGBLOB")
    private byte[] fotoPerfil;

    // ── Getters & Setters ──────────────────────

    public Integer getCodigoUsuario() { return codigoUsuario; }
    public void setCodigoUsuario(Integer codigoUsuario) { this.codigoUsuario = codigoUsuario; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public Integer getEstado() { return estado; }
    public void setEstado(Integer estado) { this.estado = estado; }

    public byte[] getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(byte[] fotoPerfil) { this.fotoPerfil = fotoPerfil; }
}