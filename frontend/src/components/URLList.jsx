import styled from 'styled-components';

function URLList({ urls, selectedAlias, onSelect }) {
  if (urls.length === 0) {
    return <EmptyText>No URLs shortened yet.</EmptyText>;
  }

  return (
    <List>
      {urls.map((u) => {
        const isOpen = u.alias === selectedAlias;
        return (
          <ListItem key={u.alias} onClick={() => onSelect(isOpen ? null : u.alias)}>
            <Row>
              <Alias>{u.alias}</Alias>
              <Chevron $open={isOpen}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Chevron>
            </Row>
            {isOpen && <OriginalUrl>{u.original_url}</OriginalUrl>}
          </ListItem>
        );
      })}
    </List>
  );
}

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1.5px solid rgb(220, 215, 200);
  border-radius: 6px;
  overflow: hidden;
  background: rgb(250, 249, 245);
`;

const ListItem = styled.li`
  padding: 0.75rem 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid rgb(230, 227, 218);
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgb(244, 242, 234);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Alias = styled.span`
  font-family: 'SF Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(58, 54, 46);
`;

const Chevron = styled.span`
  display: flex;
  color: rgb(150, 145, 130);
  transform: rotate(${(props) => (props.$open ? '180deg' : '0deg')});
  transition: transform 0.15s ease;
`;

const OriginalUrl = styled.div`
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: rgb(122, 117, 103);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyText = styled.p`
  color: rgb(150, 145, 130);
  font-style: italic;
`;

export default URLList;