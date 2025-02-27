import '../css/page-login.css'

const Login = () => {
    return (
        <div className="login-container">
            <h1>Sign in with email</h1>
            <h2>Continue browsing the best books available.</h2>
            <form>
                <input type="email" placeholder='Email'></input>
                <input type="password" placeholder='Password'></input>
                <h3>Forgot password?</h3>
                <button>Continue</button>
            </form>
            
        </div>
    );
}

export default Login;