-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nivel INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);

CREATE TABLE workspaces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(255) NOT NULL UNIQUE,
  criado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT workspaces_pkey PRIMARY KEY (id),
  CONSTRAINT workspaces_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE workspace_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  usuario_id INT NOT NULL,
  role VARCHAR(20) DEFAULT 'member', -- 'admin' or 'member'
  CONSTRAINT workspace_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT workspace_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT workspace_usuarios_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE projetos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT projetos_pkey PRIMARY KEY (id),
  CONSTRAINT projetos_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE projeto_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projeto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  CONSTRAINT projeto_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT projeto_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT projeto_usuarios_projeto_id_fkey FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

CREATE TABLE sessoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  projeto_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sessoes_pkey PRIMARY KEY (id),
  CONSTRAINT sessoes_projeto_id_fkey FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

CREATE TABLE sessao_usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sessao_id INT NOT NULL,
  usuario_id INT NOT NULL,
  CONSTRAINT sessao_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT sessao_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT sessao_usuarios_sessao_id_fkey FOREIGN KEY (sessao_id) REFERENCES sessoes(id)
);

CREATE TABLE etapas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sessao_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(255) NOT NULL DEFAULT 'Não iniciado',
  responsavel_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT etapas_pkey PRIMARY KEY (id),
  CONSTRAINT etapas_sessao_id_fkey FOREIGN KEY (sessao_id) REFERENCES sessoes(id),
  CONSTRAINT etapas_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE TABLE notas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  projeto_id INT,
  sessao_id INT,
  criado_por INT,
  titulo VARCHAR(255),
  conteudo TEXT,
  cor VARCHAR(255) DEFAULT '#fff9c4',
  anexos JSON DEFAULT ('[]'),
  pos_x INT DEFAULT 0,
  pos_y INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notas_pkey PRIMARY KEY (id),
  CONSTRAINT notas_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  CONSTRAINT notas_projeto_id_fkey FOREIGN KEY (projeto_id) REFERENCES projetos(id),
  CONSTRAINT notas_sessao_id_fkey FOREIGN KEY (sessao_id) REFERENCES sessoes(id),
  CONSTRAINT notas_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE avisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_por INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT avisos_pkey PRIMARY KEY (id),
  CONSTRAINT avisos_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  CONSTRAINT avisos_criado_por_fkey FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

CREATE TABLE logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT,
  usuario_id INT,
  usuario_nome VARCHAR(255),
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT logs_pkey PRIMARY KEY (id),
  CONSTRAINT logs_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  CONSTRAINT logs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);