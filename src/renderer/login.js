// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // Hide previous error
    errorMessage.style.display = 'none';
    
    if (!username || !password) {
        errorText.textContent = 'Lütfen kullanıcı adı ve şifre girin';
        errorMessage.style.display = 'block';
        return;
    }
    
    try {
        const user = await window.api.authenticateUser(username, password);
        
        if (user) {
            // Kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        } else {
            errorText.textContent = 'Kullanıcı adı veya şifre hatalı!';
            errorMessage.style.display = 'block';
            
            // Şifre alanını temizle
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    } catch (error) {
        console.error('Login error:', error);
        errorText.textContent = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
        errorMessage.style.display = 'block';
    }
});

// Enter tuşu ile form gönderimi
document.getElementById('password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
});

