package com.lchan.SistemaVentas.Service;
import com.lchan.SistemaVentas.Entity.Usuarios;
import com.lchan.SistemaVentas.Repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuariosServiceImplements implements UsuariosService {

    private final UsuarioRepository usuarioRepository;

    public UsuariosServiceImplements(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<Usuarios> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuarios getUsuariosById(Integer codigoUsuario) {
        return usuarioRepository.findById(codigoUsuario).orElse(null);
    }

    @Override
    public Usuarios saveUsuarios(Usuarios usuarios) throws RuntimeException {
        return usuarioRepository.save(usuarios);
    }

    @Override
    public Usuarios updateUsuarios(Integer codigoUsuario, Usuarios usuarios) {
        Usuarios usuario1 = usuarioRepository.findById(codigoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario1.setUsername(usuarios.getUsername());
        usuario1.setPassword(usuarios.getPassword());
        usuario1.setEmail(usuarios.getEmail());
        usuario1.setRol(usuarios.getRol());
        usuario1.setEstado(usuarios.getEstado());

        return usuarioRepository.save(usuario1);
    }

    @Override
    public void deleteUsuarios(Integer codigoUsuario) {
        Usuarios usuario = usuarioRepository.findById(codigoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

    @Override
    public Usuarios login(String username, String password) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(username)
                        && u.getPassword().equals(password)
                        && Integer.valueOf(1).equals(u.getEstado()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Usuarios registrar(Usuarios usuarios) throws RuntimeException {
        boolean exists = usuarioRepository.findAll().stream()
                .anyMatch(u -> u.getUsername().equalsIgnoreCase(usuarios.getUsername()));
        if (exists) throw new RuntimeException("El nombre de usuario ya está en uso");

        if (usuarios.getRol() == null || usuarios.getRol().isBlank())
            usuarios.setRol("vendedor");
        usuarios.setEstado(1);

        return usuarioRepository.save(usuarios);
    }

    @Override
    public Usuarios updateFoto(Integer codigoUsuario, byte[] foto) {
        Usuarios u = usuarioRepository.findById(codigoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.setFotoPerfil(foto);
        return usuarioRepository.save(u);
    }

    @Override
    public byte[] getFoto(Integer codigoUsuario) {
        Usuarios u = usuarioRepository.findById(codigoUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return u.getFotoPerfil();
    }
}