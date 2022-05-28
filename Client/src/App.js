import { useEffect, useState } from 'react';
import Axios from 'axios'
import './App.css';

function App() {
  const MINUTE_MS = 30000;
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginStatus, setLoginStatus] = useState(Boolean);

  let formData = new FormData();

  Axios.defaults.withCredential = true;


  const register = () => {
    Axios.post("http://localhost:8000/imageGallery/register", {
      username: usernameReg,
      password: passwordReg,
    }).then((response) => {
      console.log(response);
    })
  }

  const login = () => {
    Axios.post("http://localhost:8000/imageGallery/login", {
      username: username,
      password: password,
    }).then((response) => {
      if (!response.data.auth) {
        setLoginStatus(false);
      } else {
        localStorage.setItem("token", response.data.token);
        setLoginStatus(true);
      }
    });
  };

  const isUserAuth = () => {
    Axios.get("http://localhost:8000/imageGallery/isUserAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    }).then((response) => {
      if (response.data.auth === true)
        setLoginStatus(true);
      else
        setLoginStatus(false);

    });
  };

  const onFileChange = (e) => {
    if (e.target && e.target.files[0]) {
      formData.set('file', e.target.files[0]);
    }
  }

  const onGenreChange = (e) => {
    if (e.target && e.target.value) {
      formData.set('genre', e.target.value);
    }
  }

  const submitFileData = () => {
    Axios.post("http://localhost:8000/imageGallery/uploadImage", formData, {
      headers: { 'content-type': 'multipart/form-data', "x-access-token": localStorage.getItem("token"), }
    }).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    })
  }

  const fileUpload = () => {
    return (
      <form>
        <input type="file" className='fileInput' name="file" label='file' onChange={onFileChange} />
        <br></br>
        <label htmlFor='genre'>Picture genre:  </label>
        <input type="text" className='fileInput' name="genre" label='genre' onChange={onGenreChange} />
        <input type='button' value='Upload!' label='submitButton' onClick={submitFileData} />
      </form>
    )
  }

  useEffect(() => {

    isUserAuth();
    const interval = setInterval(() => {
      isUserAuth();
    }, MINUTE_MS);

    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      <div>
        <h1>Registration</h1>

        <div className='input-container'>
          <input type="text" required
            onChange={(e) => {
              setUsernameReg(e.target.value);
            }} />

          <label>Enter New Username here</label>
        </div>

        <div className='input-container'>
          <input type="password" required
            onChange={(e) => {
              setPasswordReg(e.target.value);
            }} />
          <label>Enter New Password here</label>
        </div>
        <button onClick={() => register()}>Register</button>
      </div>
      <div>
        <h1>Login</h1>
        <div className='input-container'>
          <input
            type="text" required
            name='loginUsername'
            onChange={(e) => {
              setUsername(e.target.value);
            }} />
          <label>Type Username Here</label>
        </div>
        <div className='input-container'>
          <input
            type="password" required
            name='loginPassword'
            onChange={(e) => {
              setPassword(e.target.value);
            }} />
          <label>Type Password Here</label>
        </div>
        <button onClick={() => login()}>Login</button>
      </div>

      {loginStatus ? fileUpload() : null}

    </div>

  );
}

export default App;
