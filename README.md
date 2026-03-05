# CourtIQ

Visualize NBA players' efficiency from various spots in the half-court. Leveraging `nba_api` and [shotchart.d3.ts](https://github.com/michaelmirandi/shotchart.d3.ts).

## To Run
First create .env in project root and add ```VITE_API_HOST=http://127.0.0.1:8000```


### Docker Containers
1. Run:

   ```bash
   docker compose up -d --build
   ```
3. Navigate to:
   [http://127.0.0.1:5174](http://127.0.0.1:5174)

### Locally
1. From the `frontend` folder:

   ```bash
   npm run dev
   ```
2. From the `backend` folder (inside your Python environment):

   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## API Spec

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Screenshots
<img width="1912" height="982" alt="image" src="https://github.com/user-attachments/assets/9fc1b0bc-6e1a-4a91-bf8f-d4f3d15c6354" />
