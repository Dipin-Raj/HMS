# HMS-AI - System Architecture

## 1. Architectural Style

The HMS-AI system is designed using a **microservices-oriented architecture**. The backend is a set of loosely coupled services, containerized using Docker, that communicate via a well-defined API. This approach allows for scalability, modularity, and independent development and deployment of different parts of the system.

The frontend is a **Single-Page Application (SPA)** built with React, which interacts with the backend services through RESTful APIs.

## 2. Backend Architecture

The backend is built with **FastAPI**, a modern, high-performance Python web framework. The architecture is layered to separate concerns:

- **Presentation Layer (Routers):** This layer is responsible for handling HTTP requests and responses. It uses FastAPI's routers to define API endpoints. It handles request validation (using Pydantic schemas) and authentication/authorization.

- **Service Layer:** This layer contains the core business logic of the application. Services are responsible for orchestrating data from different sources (like the database and AI models) to fulfill the use cases of the application.

- **Data Access Layer (Models & Database):** This layer is responsible for data persistence. It uses **SQLAlchemy** as the ORM to interact with the **PostgreSQL** database. The models define the database schema.

- **AI/ML Layer:** This layer consists of Python modules that contain the machine learning models. These models are exposed as services that can be called by the main backend application. The models will be trained on historical data and can be retrained periodically.

## 3. Frontend Architecture

The frontend is a **React** application with role-based dashboards.

- **Components-Based Architecture:** The UI is broken down into reusable components.
- **State Management:** A state management library (like Redux or Zustand) will be used to manage the application's state.
- **Services:** The frontend has its own service layer for communicating with the backend APIs.
- **Role-Based Views:** The UI will dynamically render different dashboards and components based on the logged-in user's role.

## 4. Authentication and Authorization

Authentication is handled using **JSON Web Tokens (JWT)**. When a user logs in, the backend generates a JWT that contains the user's ID and role. This token is sent with every subsequent request to the backend.

Authorization is implemented using **Role-Based Access Control (RBAC)**. API endpoints are protected based on the user's role, ensuring that users can only access the resources they are permitted to.

## 5. Real-time Communication

To ensure that all updates reflect in real-time across different portals, we will use **WebSockets**. The FastAPI backend can push updates to connected clients (the React frontend) when certain events occur (e.g., a new appointment is booked, a patient's medical record is updated).

## 6. Deployment

The entire application (backend, frontend, database) will be containerized using **Docker** and orchestrated with **Docker Compose**. This makes the application easy to set up, deploy, and scale.
