IF DB_ID('crud') IS NULL
BEGIN
    CREATE DATABASE crud;
END
GO

USE crud;
GO

IF OBJECT_ID('dbo.tb_cad_produto', 'U') IS NOT NULL DROP TABLE dbo.tb_cad_produto;
IF OBJECT_ID('dbo.tb_checkout', 'U') IS NOT NULL DROP TABLE dbo.tb_checkout;
IF OBJECT_ID('dbo.tb_checkin', 'U') IS NOT NULL DROP TABLE dbo.tb_checkin;
IF OBJECT_ID('dbo.tb_cad_quarto', 'U') IS NOT NULL DROP TABLE dbo.tb_cad_quarto;
GO

CREATE TABLE dbo.tb_cad_produto (
    id_produto INT IDENTITY(1,1) PRIMARY KEY,
    nome_produto VARCHAR(120) NOT NULL,
    descricao VARCHAR(255) NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL DEFAULT 0
);
GO

CREATE TABLE dbo.tb_cad_quarto (
    id_quarto INT IDENTITY(1,1) PRIMARY KEY,
    numero_quarto VARCHAR(20) NOT NULL,
    tipo_quarto VARCHAR(80) NOT NULL,
    valor_diaria DECIMAL(10,2) NOT NULL,
    status_quarto VARCHAR(30) NOT NULL DEFAULT 'Livre'
);
GO

CREATE TABLE dbo.tb_checkin (
    id_checkin INT IDENTITY(1,1) PRIMARY KEY,
    hospede_nome VARCHAR(150) NOT NULL,
    id_quarto INT NOT NULL,
    data_entrada DATE NOT NULL,
    data_saida_prevista DATE NOT NULL,
    status_checkin VARCHAR(30) NOT NULL DEFAULT 'Ativo',
    CONSTRAINT FK_checkin_quarto FOREIGN KEY (id_quarto) REFERENCES dbo.tb_cad_quarto(id_quarto)
);
GO

CREATE TABLE dbo.tb_checkout (
    id_checkout INT IDENTITY(1,1) PRIMARY KEY,
    id_checkin INT NOT NULL,
    data_checkout DATE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(60) NOT NULL,
    observacao VARCHAR(255) NULL,
    CONSTRAINT FK_checkout_checkin FOREIGN KEY (id_checkin) REFERENCES dbo.tb_checkin(id_checkin)
);
GO
