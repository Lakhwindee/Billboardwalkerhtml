import React from 'react';
import { Route, Router } from 'wouter';
import SigninPage from './pages/signin';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <Router>
      <Route path="/" component={SigninPage} />
      <Route path="/signin" component={SigninPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Dashboard} />
    </Router>
  );
}

export default App;