/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function startGame() {
    const gameStart = Date.now(); // ゲーム開始時刻を記録
    const canvas = document.getElementById('gameCanvas');
    // canvasの高さと幅をブラウザの高さと幅に設定
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    // あおむし
    const aomushiImages = ['public/aomushi1.png', 'public/aomushi2.png'].map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
    // ジャンプ高さ上限
    const maxJumpHeight = canvas.height / 3;
    // 太陽
    const sunImage = new Image();
    sunImage.src = 'public/sun.png';
    // 月
    const moonImage = new Image();
    moonImage.src = 'public/moon.png';
    // フルーツの画像を読み込む
    const fruitImages = ['public/apple.png', 'public/nashi.png', 'public/orange.png', 'public/strawberry.png', 'public/sumomo.png'].map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });
    // フルーツの初期位置と速度を設定
    let fruitX = canvas.width;
    // ランダムなy座標
    let fruitY = Math.random() * (canvas.height - maxJumpHeight - fruitImages[0].height) + maxJumpHeight;
    const fruitSpeed = 2;
    // フルーツの画像をランダムに選択
    let currentFruitImage = fruitImages[Math.floor(Math.random() * fruitImages.length)];
    let frameCount = 0;
    let jumpStart = 0;
    let y = canvas.height - aomushiImages[0].height * 2;
    let jumping = false;
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            // aomushiが最初の位置にいるときだけ新たなジャンプを開始
            const initialPosition = canvas.height - aomushiImages[0].height * 2;
            if (!jumping && y === initialPosition) {
                jumping = true;
                jumpStart = Date.now();
            }
        }
    });
    // 画面タップでジャンプ（スマホ対応）
    canvas.addEventListener('touchstart', () => {
        // aomushiが最初の位置にいるときだけ新たなジャンプを開始
        const initialPosition = canvas.height - aomushiImages[0].height * 2;
        if (!jumping && y === initialPosition) {
            jumping = true;
            jumpStart = Date.now();
        }
    });
    // キーを離したときの処理を関数に切り出す
    function handleSpaceKeyUp() {
        jumpStart = 0;
        jumping = false;
    }
    window.addEventListener('keyup', (event) => {
        if (event.code === 'Space') {
            handleSpaceKeyUp();
        }
    });
    function update() {
        // キャンバスをクリアする
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 現在の時間を取得
        const currentTime = Date.now();
        // 15秒ごとに背景色を変更
        if (Math.floor((currentTime - gameStart) / 1000) % 30 < 15) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 右上に太陽を描画
            ctx.drawImage(sunImage, (canvas.width - sunImage.width) - 50, 50, sunImage.width, sunImage.height);
        }
        else {
            ctx.fillStyle = '#223a70';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 右上に月を描画
            ctx.drawImage(moonImage, (canvas.width - moonImage.width) - 50, 50, moonImage.width, moonImage.height);
        }
        // 画像を描画する。10フレームごとに画像を切り替える
        const img = aomushiImages[Math.floor(frameCount / 10) % aomushiImages.length];
        if (jumping) {
            const jumpTime = Date.now() - jumpStart;
            const jumpSpeed = 1;
            y = Math.max(canvas.height - img.height * 2 - jumpTime / jumpSpeed, maxJumpHeight);
            // 上限まで達したらjumpStartをリセットします
            if (y === maxJumpHeight) {
                handleSpaceKeyUp();
            }
        }
        else {
            y = Math.min(y + 10, canvas.height - img.height * 2);
        }
        ctx.drawImage(img, 0, y, img.width * 2, img.height * 2);
        // ゲーム開始から3秒後にフルーツを移動開始
        if (Date.now() - gameStart >= 3000) {
            fruitX -= fruitSpeed;
        }
        // フルーツを描画
        if (fruitX + currentFruitImage.width > 0) {
            // アオムシとフルーツの衝突判定
            if (fruitX < img.width * 2 && fruitX + currentFruitImage.width > 0 &&
                fruitY < y + img.height * 2 && fruitY + currentFruitImage.height > y) {
                // 衝突した場合、フルーツを再生成
                fruitX = canvas.width;
                // ランダムなy座標
                fruitY = Math.random() * (canvas.height - maxJumpHeight - currentFruitImage.height) + maxJumpHeight;
                // ランダムに新しいフルーツの画像を選択
                currentFruitImage = fruitImages[Math.floor(Math.random() * fruitImages.length)];
            }
            else {
                ctx.drawImage(currentFruitImage, fruitX, fruitY);
            }
        }
        // フルーツがキャンバスからはみ出たら、再度右から出現
        if (fruitX + currentFruitImage.width < 0) {
            fruitX = canvas.width;
            // ランダムなy座標
            fruitY = Math.random() * (canvas.height - maxJumpHeight - currentFruitImage.height) + maxJumpHeight;
            // ランダムに新しいフルーツの画像を選択
            currentFruitImage = fruitImages[Math.floor(Math.random() * fruitImages.length)];
        }
        // 枠線を再描画する
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        // フレームカウントを更新する
        frameCount++;
    }
    function gameLoop() {
        update();
        // ブラウザは通常、1秒間に約60回この関数を呼び出します。つまり、requestAnimationFrameを使用すると、ゲームのフレームレートは約60FPSになります。
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
