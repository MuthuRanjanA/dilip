package com.tatastrive.erp.JAM.Enterprises.config;

import java.util.Optional;

import com.tatastrive.erp.JAM.Enterprises.Entity.AppUser;
import com.tatastrive.erp.JAM.Enterprises.Repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class MyUserDetailSerivce implements UserDetailsService {

	@Autowired
	private AppUserRepository userRepo;
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		
	
		
		AppUser existingUser= userRepo.findByEmail(email).orElseThrow(()->new UsernameNotFoundException("user not found") );
		
		
		
		
		
		UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
							.username(existingUser.getEmail())
							.password(existingUser.getPassword())
							.authorities(existingUser.getRole().name())
				.disabled(!existingUser.isEnabled())
							.build();
		
		return userDetails;
	}

}
