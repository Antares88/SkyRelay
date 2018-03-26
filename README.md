# SkyRelay
실시간 멀티플레이 게임을 구현하고자 할 때 홀펀칭에 사용되는 릴레이 서버입니다.

## 설치하기
```
git clone https://github.com/Hanul/SkyRelay
```

## 설정
`config.json` 파일을 수정합니다.
```javascript
{
	"port": 8726
}
```
`port`는 필수 설정입니다.

## 실행
```
node SkyRelay.js
```
```
forever start SkyRelay.js
```

## 라이센스
[MIT](LICENSE)

## 작성자
[Young Jae Sim](https://github.com/Hanul)