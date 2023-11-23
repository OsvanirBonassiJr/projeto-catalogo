//npm install jsonwebtoken body-parser express pg sequelize bcrypt dotenv cors multer
require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const multer = require('multer');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const upload = multer({ dest: '../imagens' });

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

//------------------------------------------



const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({ //troque para seu perfil
  dialect: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'CatImo',
});


//Definição das tabelas
const Usuario = sequelize.define(
  'usuarios',
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    paranoid: true,
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
    imagens: { type: DataTypes.STRING, },
    tipo_operacao: { type: DataTypes.STRING, },
    id_usuario: { type: DataTypes.INTEGER, },
    zona: { type: DataTypes.STRING, },
    cidade: { type: DataTypes.STRING, },
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
    paranoid: true,
  }
);


/* devido ao tempo algumas tabelas e codigos foram comentados pois não serão usados, pois suas funções tomariam muito tempo e foram substituidas por formas mais simples de serem usados.


const Especificacao = sequelize.define(
  'especificacoes',
  {
    id_espec: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_imovel: {
      type: DataTypes.INTEGER,
      references: {
        model: 'imoveis',
        key: 'id_imovel'
      }
    },
    descricao: { type: DataTypes.STRING },
    medida: { type: DataTypes.STRING },
    quantidade: { type: DataTypes.INTEGER }
  },
  {
    timestamps: false,
    paranoid: true
  }
);

Imovel.hasMany(Especificacao, { foreignKey: 'id_imovel' });
Especificacao.belongsTo(Imovel, { foreignKey: 'id_imovel' });
*/

/*
const ft_Espec = sequelize.define(
  'fotos_espec',
  {
    id_foto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_espec: { type: DataTypes.STRING },
    descricao: { type: DataTypes.STRING },
  },
  {
    timestamps: false,
    paranoid: true,
  }
);*/
/*
const arq_Doc = sequelize.define(
  'arquivos_doc',
  {
    id_arq: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_doc: { type: DataTypes.STRING },
    descricao: { type: DataTypes.STRING },
  },
  {
    timestamps: false,
    paranoid: true,
  }
);*/
/*
const doc_Ope = sequelize.define(
  'doc_ope',
  {
    id_doc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_operacao: { type: DataTypes.STRING },
    descricao: { type: DataTypes.STRING },
  },
  {
    timestamps: false,
    paranoid: true,
  }
);*/


//Funções Usuario
async function criarUsuario(req, res) {
  try {
    if (!req.body.nome || !req.body.sobrenome || !req.body.email || !req.body.senha || !req.body.cpf || !req.body.cidade || !req.body.data_nasc || !req.body.rg || !req.body.cep || !req.body.telefone) {
      return res.status(422).json({ msg: "Campos obrigatórios não foram preenchidos" });
    }
    console.log(req.body)
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }

}

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
  res.json({ token: jwt.sign(JSON.stringify(usuario), 'senha do token') })

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


//Funções Imovel

async function criarImovel(req, res) {
  try {

    const { tipo_operacao, id_usuario, zona, cidade, estado, especie, valor, bairro, rua, cep, numero, complemento, tamanho_terreno, tamanho_moradia, info_complementares } = req.body;

    const imagens = req.files.map(files => files.path);
    console.log(imagens)

    const imovel = await Imovel.create({
      tipo_operacao,
      id_usuario,
      zona,
      cidade,
      estado,
      cep,
      especie,
      valor,
      bairro,
      rua,
      numero,
      complemento,
      tamanho_terreno,
      tamanho_moradia,
      info_complementares,
      imagens,
    });

    console.log('Imóvel criado com sucesso:', imovel);

    return res.status(201).json({ success: true, imovel });

  } catch (error) {
    console.error('Erro ao criar imóvel:', error);
    //return res.status(500).json({ error: 'Erro interno no servidor.' });
  }

}

async function listarImoveis(req, res) {
  try {
    const imoveis = await Imovel.findAll();
    res.json(imoveis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar imóveis' });
  }

}

//usuarios
app.post('/usuario', criarUsuario);
app.post('/login', login);
app.get('/usuarios', listarUsuarios);
app.delete('/usuarios/:id_usuario', deletarUsuario);
app.put('/usuarios/:id_usuario', atualizarUsuario);
app.patch('/usuarios/:id_usuario', atualizarUsuarioParcialmente);

//imoveis
app.post('/imovel', upload.array('imagens'), (req, res) => {
  console.log(req.body);
  console.log(req.files);

  criarImovel(req.body, req.files)
    .then(result => {
      res.json(result);
    })
    .catch(error => {
      console.error(error);
      // res.status(500).json({ error: 'Erro ao processar a solicitação' });
    });
});

app.get('/imoveis', listarImoveis);