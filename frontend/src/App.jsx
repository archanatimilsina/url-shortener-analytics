import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import URLShortenerForm from '../src/components/URLShortenerForm';
import URLList from '../src/components/URLList';
import AnalyticsChart from '../src/components/AnalyticsChart';
import useApi from '../src/hooks/api';

function App() {
  const [urls, setUrls] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState(null);
  const { get, loading: listLoading } = useApi();

  const fetchUrls = useCallback(async () => {
    const { success, data } = await get('api/urls/');
    if (success) {
      setUrls(data);
    }
  }, [get]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  return (
    <Page>
      <Header>
        <Title>
          URL Shortener
          <Underline viewBox="0 0 220 12" preserveAspectRatio="none">
            <path
              d="M2 8c20-6 40-6 60-2s40 6 60 2 40-6 60-2 30 4 34 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Underline>
        </Title>
        <Subtitle>Shorten links and track engagement over time.</Subtitle>
      </Header>

      <URLShortenerForm onNewUrl={fetchUrls} />

      <Layout>
        <ListPane>
          <PaneLabel>Your links</PaneLabel>
          {listLoading ? (
            <LoadingText>Loading...</LoadingText>
          ) : (
            <URLList
              urls={urls}
              selectedAlias={selectedAlias}
              onSelect={setSelectedAlias}
            />
          )}
        </ListPane>

        <DetailPane>
          {selectedAlias ? (
            <AnalyticsChart alias={selectedAlias} />
          ) : (
            <EmptyState>
              <EmptyTitle>No link selected</EmptyTitle>
              <EmptyText>Choose a link on the left to see its click activity.</EmptyText>
            </EmptyState>
          )}
        </DetailPane>
      </Layout>
    </Page>
  );
}

const Page = styled.div`
  max-width: 1070px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;
  color: rgb(122, 117, 103);
  background: rgb(246, 245, 240);
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2.25rem;
`;

const Title = styled.h1`
  position: relative;
  display: inline-block;
  font-family: Georgia, 'Iowan Old Style', ui-serif, serif;
  font-size: 2rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: rgb(58, 54, 46);
  margin: 0 0 0.5rem;
`;

const Underline = styled.svg`
  display: block;
  width: 100%;
  height: 10px;
  margin-top: 2px;
  color: rgb(122, 117, 103);
  opacity: 0.55;
`;

const Subtitle = styled.p`
  font-size: 0.92rem;
  color: rgb(122, 117, 103);
  margin: 0;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.75rem;
  margin-top: 2.25rem;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ListPane = styled.div``;

const PaneLabel = styled.h2`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(150, 145, 130);
  margin: 0 0 0.75rem;
`;

const DetailPane = styled.div`
  min-width: 0;
`;

const EmptyState = styled.div`
  border: 1.5px dashed rgb(200, 195, 180);
  border-radius: 4px;
  padding: 3rem 1.5rem;
  text-align: center;
  background: rgb(250, 249, 245);
  transform: rotate(-0.3deg);
`;

const EmptyTitle = styled.p`
  font-family: Georgia, 'Iowan Old Style', ui-serif, serif;
  font-weight: 500;
  font-size: 1rem;
  color: rgb(80, 76, 65);
  margin: 0 0 0.35rem;
`;

const EmptyText = styled.p`
  color: rgb(150, 145, 130);
  font-size: 0.85rem;
  margin: 0;
`;

const LoadingText = styled.p`
  color: rgb(150, 145, 130);
  font-style: italic;
`;

export default App;