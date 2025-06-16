import { useState, useEffect } from 'react'
import { Container, Owner, Loading, FilterList, BackButton, PageActions, IssuesList } from './styles';
import { useParams } from "react-router-dom";
import api from '../../services/api';
import { FaArrowLeft } from 'react-icons/fa';


export default function Repositorio() {

  const { repositorioName } = useParams()
  const [issues, setIssues] = useState([]);
  const [repositorio, setRepositorio] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([
    { state: 'all', label: 'Todas', isActive: true },
    { state: 'open', label: 'Abertas', isActive: false },
    { state: 'closed', label: 'Fechadas', isActive: false }
  ]);

  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    async function loadData() {

      const [repositorioData, issuesData] = await Promise.all([
        api.get(`repos/${decodeURIComponent(repositorioName)}`),
        api.get(`repos/${decodeURIComponent(repositorioName)}/issues`, {
          params: {
            state: filters.find(filter => filter.isActive).state,
            per_page: 5,
          }
        })
      ])

      setRepositorio(repositorioData.data);
      setIssues(issuesData.data);
      setLoading(false);
    }
    loadData();
  }, [decodeURIComponent(repositorioName), page]);

  useEffect(() => {
    async function loadIssues() {
      const response = await api.get(`repos/${decodeURIComponent(repositorioName)}/issues`, {
        params: {
          state:filters[filterIndex].state,
          per_page: 5,
          page,
        }
      });

      setIssues(response.data);
    }

    loadIssues();
  }, [filters,filterIndex, page, decodeURIComponent(repositorioName)]);

  function handlePage(action) {
    setPage(action === 'back' ? page - 1 : page + 1);

  }

  function handleIndex(index) {
    setFilterIndex(index);
  };


  if (loading) {
    return (
      <Loading>
        <h1>Carregando...</h1>
      </Loading>
    )
  }

  return (
    <Container>

      <BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </BackButton>


      <Owner>
        <img src={repositorio.owner?.avatar_url} alt={repositorio.owner?.login} />
        <h1>{repositorio.name}</h1>
        <p>{repositorio.description}</p>
      </Owner>

      <FilterList active={filterIndex}>
        {
          filters.map((filter, index) => (
            <button type="button" key={String(filter.label)} onClick={() => handleIndex(index)}>
              {filter.label}
            </button>
          ))
        }

      </FilterList>

      <IssuesList>
        {
          issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />

              <div>
                <strong>
                  <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                    {issue.title}
                  </a>
                  {
                    issue.labels.map(label => {
                      <span key={String(label.id)}>{label.name}</span>
                    })
                  }
                </strong>
                <p>{issue.user.login}</p>
              </div>



            </li>
          ))
        }
      </IssuesList>


      <PageActions>

        <button type="button" onClick={() => handlePage('back')} disabled={page < 2}>
          Voltar
        </button>

        <button type="button" onClick={() => handlePage('next')}>
          Proxima
        </button>

      </PageActions>


    </Container>
  );
}