package br.com.guesthesong.guesthesong.service;

import br.com.guesthesong.guesthesong.model.Any;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import br.com.guesthesong.guesthesong.repository.AnyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AnyService {

    @Autowired
    private AnyRepository anyRepository;

    public Any salvar(Any any){
        return anyRepository.save(any);
    }

    public List<Any> lista(){
        return anyRepository.findAll();
    }

    public Optional<Any> buscarPorId(long id){
        return anyRepository.findById(id);
    }

    public void remover(Long id){
        anyRepository.deleteById(id);
    }
}
