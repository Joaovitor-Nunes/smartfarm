import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/login.module.css';

export default function Login() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const usuarioRef = useRef(null);

  useEffect(() => {
    if (usuarioRef.current) usuarioRef.current.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setIsError(false);

    if (typeof window === 'undefined') return;

    const listaUser = JSON.parse(localStorage.getItem('listaUser') || '[]');
    const userValid = listaUser.find(
      (u) => u.userCad === usuario && u.senhaCad === senha
    );

    if (userValid) {
      const mathRandom = Math.random().toString(16).substring(2);
      const token = mathRandom + mathRandom;
      localStorage.setItem('token', token);
      localStorage.setItem(
        'userLogado',
        JSON.stringify({
          nome: userValid.nomeCad,
          user: userValid.userCad,
          senha: userValid.senhaCad
        })
      );
      router.push('/');
    } else {
      setIsError(true);
      setMsg('Usuário ou senha incorretos');
      if (usuarioRef.current) usuarioRef.current.focus();
    }
  }

  const containerClass = `${styles.container} ${isError ? styles.hasError : ''}`;

  return (
    <>
      <Head>
        <title>Acessar - Smart Farm</title>
      </Head>

      {/* centraliza apenas o card de login */}
      <div className={styles.page}>
        <div className={containerClass}>
          <div className={styles.logo}>Smart Farm</div>

          <h1 className={styles.title}>Acessar Sistema</h1>
          <p className={styles.loginSubtitle}>Sistema de Monitoramento Inteligente</p>

          {msg && (
            <div
              id="msgError"
              className={`${styles.message} ${isError ? styles.error : styles.success}`}
              aria-live="polite"
            >
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label id="userLabel" htmlFor="usuario" className={styles.label}>
                Usuário
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  autoComplete="username"
                  required
                  ref={usuarioRef}
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label id="senhaLabel" htmlFor="senha" className={styles.label}>
                Senha
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="senha"
                  name="senha"
                  type={showSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={styles.input}
                />
                <button
                  type="button"
                  id="toggleSenha"
                  className={styles.togglePassword}
                  aria-label="Mostrar/ocultar senha"
                  onClick={() => setShowSenha((s) => !s)}
                >
                  {showSenha ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <button type="submit" className={styles.btn}>
                Entrar
              </button>
            </div>
          </form>

          <hr className={styles.hr} />

          <p className={styles.linkText}>
            Não tem uma conta? <a href="/signup">Cadastre-se</a>
          </p>
        </div>
      </div>
    </>
  );
}