// 폼 입력값 유효성 검사
function validateJsonInput(input) {
    try {
        JSON.parse(input);
        return true;
    } catch (e) {
        return false;
    }
}

// 텍스트 영역 자동 크기 조절
document.querySelectorAll('textarea').forEach(textarea => {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}); 