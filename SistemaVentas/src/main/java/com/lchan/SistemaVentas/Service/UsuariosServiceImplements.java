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
        Usuarios usuario1 = usuarioRepository.findById(codigoUsuario).orElse(null);

        if (usuario1 != null) {
            usuario1.setUsername(usuarios.getUsername());
            usuario1.setPassword(usuarios.getPassword());
            usuario1.setEmail(usuarios.getEmail());
            usuario1.setRol(usuarios.getRol());
            usuario1.setEstado(usuarios.getEstado());
        } else {
            throw new RuntimeException("Usuario no encontrado");
        }

        return usuarioRepository.save(usuario1);
    }

    @Override
    public void deleteUsuarios(Integer codigoUsuario) {
        Usuarios usuario = usuarioRepository.findById(codigoUsuario).orElse(null);

        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado");
        }

        usuarioRepository.delete(usuario);
    }
}