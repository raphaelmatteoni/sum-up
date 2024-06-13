import logo from './logo.svg';
import './App.css';
import CameraCapture from './components/form/CameraCapture';
import SendText from './components/form/SendText';

function App() {
  return (
    <div className="App">
      <header className="App-header space-y-4 p-4">
        <div className="m-2 w-full">
          <CameraCapture />
        </div>
        <span className="text-sm">ou</span>
        <div className="flex flex-col items-center w-full">
          <label htmlFor="send-text" className="text-base m-2">Colar texto abaixo:</label>
          <SendText />
        </div>
      </header>
    </div>
  );
}

export default App;
