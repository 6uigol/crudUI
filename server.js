const express = require('express');
const sql = require('mssql');
const path = require('path');
const dbConfig = require('./config');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const entities = {
  produtos: {
    table: 'tb_cad_produto',
    id: 'id_produto',
    columns: ['nome_produto', 'descricao', 'preco', 'estoque']
  },
  quartos: {
    table: 'tb_cad_quarto',
    id: 'id_quarto',
    columns: ['numero_quarto', 'tipo_quarto', 'valor_diaria', 'status_quarto']
  },
  checkin: {
    table: 'tb_checkin',
    id: 'id_checkin',
    columns: ['hospede_nome', 'id_quarto', 'data_entrada', 'data_saida_prevista', 'status_checkin']
  },
  checkout: {
    table: 'tb_checkout',
    id: 'id_checkout',
    columns: ['id_checkin', 'data_checkout', 'valor_total', 'forma_pagamento', 'observacao']
  }
};

function getEntity(entityName) {
  const entity = entities[entityName];
  if (!entity) {
    throw new Error('Entidade inválida');
  }
  return entity;
}

app.get('/api/:entity', async (req, res) => {
  const { entity: entityName } = req.params;
  const search = req.query.search || '';

  try {
    const entity = getEntity(entityName);
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    let query = `SELECT * FROM ${entity.table}`;

    if (search) {
      const likeParts = entity.columns.map((column, index) => {
        request.input(`search${index}`, sql.VarChar, `%${search}%`);
        return `CAST(${column} AS VARCHAR(MAX)) LIKE @search${index}`;
      });

      query += ` WHERE ${likeParts.join(' OR ')}`;
    }

    query += ` ORDER BY ${entity.id} DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:entity', async (req, res) => {
  const { entity: entityName } = req.params;

  try {
    const entity = getEntity(entityName);
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    entity.columns.forEach((column) => {
      request.input(column, req.body[column] ?? null);
    });

    const columns = entity.columns.join(', ');
    const values = entity.columns.map((column) => `@${column}`).join(', ');

    await request.query(`INSERT INTO ${entity.table} (${columns}) VALUES (${values})`);
    res.status(201).json({ message: 'Registro criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:entity/:id', async (req, res) => {
  const { entity: entityName, id } = req.params;

  try {
    const entity = getEntity(entityName);
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input('id', id);

    const setClause = entity.columns.map((column) => {
      request.input(column, req.body[column] ?? null);
      return `${column} = @${column}`;
    }).join(', ');

    await request.query(`UPDATE ${entity.table} SET ${setClause} WHERE ${entity.id} = @id`);
    res.json({ message: 'Registro atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:entity/:id', async (req, res) => {
  const { entity: entityName, id } = req.params;

  try {
    const entity = getEntity(entityName);
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    request.input('id', id);
    await request.query(`DELETE FROM ${entity.table} WHERE ${entity.id} = @id`);
    res.json({ message: 'Registro excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
