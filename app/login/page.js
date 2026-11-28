"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [mode, setMode] = useState("login");
  function handleSubmit(e) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="auth-box card">
      <img
        className="auth-logo"
        src="/safelife-ai-logo.jpeg"
        alt="SafeLife AI"
      />
      <div className="auth-header">
        <h2>{mode === "login" ? "Acesso do Proprietário" : "Cadastro de Proprietário"}</h2>
        <p className="sub">
          {mode === "login"
            ? "Entre para monitorar suas caldeiras e telemetria em tempo real"
            : "Cadastre-se para gerenciar seus equipamentos e dados operacionais"}
        </p>
        <p className="sub">
          Modo de visualização: login e cadastro não autenticam nem salvam dados.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === "signup" && (
          <>
            <div className="form-group">
              <label className="input-label">Nome Completo / Responsável</label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label">Empresa / Unidade Fabril</label>
              <input
                type="text"
                placeholder="Ex: Indústria Alimentícia Beta"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="input-label">E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Senha</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>

        <button className="btn btn-primary btn-block">
          {mode === "login" ? "Entrar no Painel" : "Criar Minha Conta de Proprietário"}
        </button>
      </form>

      <div className="auth-switch">
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
          }}
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se como proprietário"
            : "Já possui conta? Faça login aqui"}
        </button>
      </div>

      <div className="auth-footer-tag">
        🛡️ Monitoramento preditivo com conformidade NR-13
      </div>
    </div>
  );
}
