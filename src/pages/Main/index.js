import { useState, useCallback, useEffect } from 'react';
import { Container, Form, SubmitButton,List,DeleteButton } from './styles';
import { FaBars, FaGithub, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa'
import { Link } from 'react-router-dom';

import api from '../../services/api';

export default function Main() {

  const [newRepo, setNewRepo] = useState('')
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Buscar

  useEffect(() => {
    const storedRepositories = localStorage.getItem('repositories');

    if (storedRepositories) {
      setRepositories(JSON.parse(storedRepositories));
    }
  }, []);

  // Salva localStorage

  useEffect(() => {
    localStorage.setItem('repositories', JSON.stringify(repositories));
  },[repositories]);




  const handleSubmit = useCallback((e) => {

    e.preventDefault();
    setLoading(true);
    setAlert(null);


    async function submit() {

      try {

        if (!newRepo) {
          throw new Error('Digite o autor/nome do repositório');
          return;
        }

        if (repositories.find(repo => repo.name === newRepo)) {
          throw new Error('Repositório já adicionado');
          return;
        }

     
        const response = await api.get(`repos/${newRepo}`)

        const data = {
          name: response.data.full_name,

        }

        setRepositories([...repositories, data]);
        setNewRepo('');
        console.log(response.data);
   
      } catch (err) {
        setAlert(true)
        console.error('Erro ao buscar repositório:', err);
      }finally {
        setLoading(false);
      }
      

      
    }
    submit();

  }, [newRepo, repositories]);

  function handleInputChange(e) {
    setNewRepo(e.target.value);
    setAlert(null);
  }

  const handleDelete = useCallback((repoName) => {
    setRepositories(repositories.filter(repo => repo.name !== repoName));
  }, [repositories]);

  return (
    <Container>
      <h1>
        <FaGithub size={24} color="#000" />
        Meus repositórios
      </h1>

      <Form onSubmit={handleSubmit} error={alert}>
        <input
          type="text"
          placeholder="Digite o nome do repositório"
          value={newRepo}
          onChange={handleInputChange}
        />

        <SubmitButton loading={loading ? 1 : 0}>
          {
            loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )
          }
        </SubmitButton>
      </Form>
          
    <List>
        {
          repositories.map(repo => (
            <li key={repo.name}>
              <span>
                <DeleteButton onClick={() => handleDelete(repo.name)}>
                  <FaTrash size={20} color="#" />
                </DeleteButton>
                {repo.name}
              </span>
              <Link to={`/repositorio/${encodeURIComponent(repo.name)}`}>
                <FaBars size={20} />
              </Link>
            </li>
          ))
        }
    </List>
    </Container>
  );
}