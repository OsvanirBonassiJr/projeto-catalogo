//npm install jsonwebtoken body-parser express pg sequelize bcrypt dotenv cors
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.listen(8080, async () => {
  console.log('App iniciado');
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Nunca utilize em produção
    console.log('Conexão com o banco de dados estabelecida na porta 8080');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
});

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({ //troque para seu perfil
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'CatImo',
});

const Usuario = sequelize.define(
  'usuarios',
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true // Automatically gets converted to SERIAL for postgres
    },
    nome: { type: DataTypes.STRING, },
    sobrenome: { type: DataTypes.STRING, },
    email: { type: DataTypes.STRING, },
    senha: { type: DataTypes.STRING, },
    cpf: { type: DataTypes.STRING, },
    cidade: { type: DataTypes.STRING, },
    data_nasc: { type: DataTypes.STRING, },
    tipo: { type: DataTypes.STRING, },
    rg: { type: DataTypes.STRING, },
    cep: { type: DataTypes.STRING, },
    telefone: { type: DataTypes.STRING, },
  },
  {
    timestamps: false,
    paranoid: true, //utilizado quando uma tabela não será deletada OBS: O campo deverá ser timestamp
  }
);

const Imovel = sequelize.define(
  'imoveis',
  {
    id_imovel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_operacao: { type: DataTypes.STRING, },
    zona: { type: DataTypes.STRING, },
    id_cidade: { type: DataTypes.STRING, },
    estado: { type: DataTypes.STRING, },
    cep: { type: DataTypes.STRING, },
    especie: { type: DataTypes.STRING, },
    valor: { type: DataTypes.STRING, },
    bairro: { type: DataTypes.STRING, },
    rua: { type: DataTypes.STRING, },
    numero: { type: DataTypes.STRING, },
    complemento: { type: DataTypes.STRING, },
    tamanho_terreno: { type: DataTypes.STRING, },
    tamanho_moradia: { type: DataTypes.STRING, },
    info_complementares: { type: DataTypes.STRING, },
  },
  {
    timestamps: false,
    paranoid: true, //utilizado quando uma tabela não será deletada OBS: O campo deverá ser timestamp
  }
)

async function criarUsuario(req, res) {
  try {
    if (!req.body.nome || !req.body.sobrenome || !req.body.email || !req.body.senha || !req.body.cpf || !req.body.cidade || !req.body.data_nasc || !req.body.rg || !req.body.cep || !req.body.telefone) {
      return res.status(422).json({ msg: "Campos obrigatórios não foram preenchidos" });
    }
    
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

//funcionando
async function login(req, res) {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  console.log(usuario)
  if (!usuario) {
    return res.status(401).json({ mensagem: 'Email não encontrado' });
  }

  if (usuario.senha != req.body.senha) {
    return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
  }
  res.json({ token: jwt.sign(JSON.stringify(usuario), 'senha do token') })  // Gere e retorne um token JWT ou faça o que for necessário após a autenticação bem-sucedida.
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

async function deletarUsuario(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    await usuario.destroy(); //o método destroy depende do 
    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
}

async function atualizarUsuario(req, res) {
  try {
    const usuario = await Usuario.findByPk(req.params.id_usuario);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    Object.assign(usuario, req.body);
    await usuario.save();
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

async function atualizarUsuarioParcialmente(req, res) {
  try {
    const [rowsUpdated, [updatedUsuario]] = await Usuario.update(req.body, {
      where: { id_usuario: req.params.id_usuario },
      returning: true, // Retorna o registro atualizado
    });
    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(updatedUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

app.post('/usuarios', async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.post('/usuario', criarUsuario);
app.post('/login', login);
app.get('/usuarios', listarUsuarios);
app.delete('/usuarios/:id_usuario', deletarUsuario);
app.put('/usuarios/:id_usuario', atualizarUsuario);
app.patch('/usuarios/:id_usuario', atualizarUsuarioParcialmente);