import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
export default function VerifyEmail() { const [params]=useSearchParams(); const [message,setMessage]=useState('Verifying your email...'); useEffect(()=>{api.get('/auth/verify-email',{params:{token:params.get('token')}}).then(()=>setMessage('Email verified. You can now sign in.')).catch(e=>setMessage(e.response?.data?.message||'Verification failed.'));},[params]); return <main className="mx-auto max-w-md p-8"><h1 className="text-2xl font-bold">Email verification</h1><p className="my-6">{message}</p><Link className="underline" to="/login">Go to login</Link></main>; }
