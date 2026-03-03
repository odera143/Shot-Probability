import { useQuery } from '@tanstack/react-query';
import React, { useState, type SetStateAction, type Dispatch } from 'react';
import { Alert, Button, Card, Form, ListGroup } from 'react-bootstrap';

const UserForm = ({
  onSubmit,
  gridFt,
  setGridFt,
}: {
  onSubmit: (params: any) => void;
  gridFt: number;
  setGridFt: Dispatch<SetStateAction<number>>;
}) => {
  const API_HOST = import.meta.env.VITE_API_HOST ?? '';
  const [playerQuery, setPlayerQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('2022-23');
  const [selectedSeasonType, setSelectedSeasonType] =
    useState<string>('Regular Season');
  const [minAtt, setMinAtt] = useState<number>(3);

  const {
    data: playerData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['players'],
    enabled: false,
    queryFn: () =>
      fetch(`${API_HOST}/api/players?q=${playerQuery}`).then((res) =>
        res.json(),
      ),
  });

  const buildRequestParams = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    const params = {
      player_id: selectedPlayer.id,
      season: selectedSeason,
      season_type: selectedSeasonType,
      grid: gridFt.toString(),
      min_att: minAtt.toString(),
    };
    onSubmit(params);
  };

  return (
    <Card
      style={{ width: '33vh' }}
      className='bg-dark text-light border-secondary'
      data-bs-theme='dark'
    >
      <Card.Body>
        <Form onSubmit={buildRequestParams}>
          <Form.Group className='mb-3'>
            <Form.Label style={{ fontWeight: 'bold' }}>
              Selected Player
            </Form.Label>
            <Form.Control
              plaintext
              readOnly
              className='text-light'
              value={`${selectedPlayer?.name ?? 'None'}`}
            />
          </Form.Group>

          <Form.Group className='mb-2' controlId='player-search'>
            <Form.Label style={{ fontWeight: 'bold' }}>Player Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='Search player name'
              value={playerQuery}
              onChange={(e) => {
                setPlayerQuery(e.target.value);
                e.target.value.length > 2 && refetch();
              }}
            />
          </Form.Group>

          <div className='mb-3'>
            {isLoading && <p className='mb-2'>Loading...</p>}
            {error && (
              <Alert className='mb-2' variant='danger'>
                Something went wrong
              </Alert>
            )}
            {playerData?.length > 0 && (
              <ListGroup
                className='border rounded'
                style={{ maxHeight: '200px', overflowY: 'auto' }}
              >
                {playerData.map((player: { id: string; name: string }) => (
                  <ListGroup.Item
                    action
                    key={player.id}
                    variant='dark'
                    active={selectedPlayer?.id === player.id}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    {player.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          <Form.Group className='mb-3' controlId='season-select'>
            <Form.Label style={{ fontWeight: 'bold' }}>Season</Form.Label>
            <Form.Select
              name='season'
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value='2018-19'>2018-19</option>
              <option value='2019-20'>2019-20</option>
              <option value='2020-21'>2020-21</option>
              <option value='2021-22'>2021-22</option>
              <option value='2022-23'>2022-23</option>
              <option value='2023-24'>2023-24</option>
              <option value='2024-25'>2024-25</option>
              <option value='2025-26'>2025-26</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className='mb-3' controlId='season-type-select'>
            <Form.Label style={{ fontWeight: 'bold' }}>Season Type</Form.Label>
            <Form.Select
              name='seasonType'
              value={selectedSeasonType}
              onChange={(e) => setSelectedSeasonType(e.target.value)}
            >
              <option value='Regular Season'>Regular Season</option>
              <option value='Playoffs'>Playoffs</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className='mb-3' controlId='min-attempts'>
            <Form.Label style={{ fontWeight: 'bold' }}>
              Minimum Attempts Per Zone
            </Form.Label>
            <Form.Control
              type='number'
              value={minAtt}
              onChange={(e) => setMinAtt(Number(e.target.value))}
            />
          </Form.Group>

          <Form.Group className='mb-4' controlId='zone-size'>
            <Form.Label style={{ fontWeight: 'bold' }}>
              Zone Size (ft)
            </Form.Label>
            <Form.Control
              type='number'
              value={gridFt}
              onChange={(e) => setGridFt(Number(e.target.value))}
            />
          </Form.Group>

          <Button type='submit' variant='primary' className='w-100'>
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};
export default UserForm;

