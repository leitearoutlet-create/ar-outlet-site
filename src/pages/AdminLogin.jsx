import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, firebaseReady } from '../firebase'

export default function AdminLogin(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const nav=useNavigate()
 async function submit(e){e.preventDefault();setError('');try{
   if(firebaseReady) await signInWithEmailAndPassword(auth,email,password)
   else if(!(email==='admin@aroutlet.com.br'&&password==='123456')) throw new Error('demo')
   localStorage.setItem('ar_admin','1');nav('/admin/painel')
 }catch{setError(firebaseReady?'E-mail ou senha inválidos.':'No modo demonstração use admin@aroutlet.com.br e senha 123456.')}}
 return <div className="admin-login"><form onSubmit={submit} className="login-card"><div className="logo big"><span>A.R</span> OUTLET</div><p>Painel Administrativo</p><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>{error&&<div className="error">{error}</div>}<button className="btn" type="submit">Entrar</button>{!firebaseReady&&<small className="demo-note">Demonstração: admin@aroutlet.com.br / 123456</small>}</form></div>
}
