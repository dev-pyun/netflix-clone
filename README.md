# netflix-clone
넷플릭스 클론 프로젝트


## 디자인
https://www.krds.go.kr/html/site/style/style_07.html 참조
디자인 토큰 형식 사용

https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
elements 기본 양식 학습 mdn

https://stock.adobe.com/kr/search?k=black+and+white+logo&search_type=recentsearch&asset_id=554944812
로고 다운로드

## 4주차 체크리스트
### 0. 3주차에 하지 못한 것들ㅠㅜ
- [ ] svg > path 영역 별도 파일로 분리
- [ ] 현재 슬라이더 위치를 나타내는 페이지 인디케이터를 추가했는가?
- [ ] social link 사진 배경색 변경
- [ ] social link를 실제 링크와 연결하기

### 1. 정적 요소 수정 사항
- [ ] css 파일 각 요소별로 (global, header, hero, slider, etc...) 분리하기
- [ ] clone 페이지는 계산하지 않는 페이지 인디케이터 추가하기
- [ ] 사용자 버튼 위에 호버시 나타나는 창 구성요소 다시 배치하기

### 2. 동적 요소 수정 사항
- [ ] ES module 방식 이용해서 JS 파일들 구조 정리
- [ ] 카드 이동방식을 카드 n개 이동시키되 총 카드의 개수는 n의 배수개가 되도록 설정
- [ ] n의 배수개가 아닌 경우에는 항상 무한 캐러셀 직전에 마지막 카드에서 멈추도록 설정
- [ ] JS 작성한 코드 작성방식의 이해가 필요 
- [ ] slider clone 영역에서 다시 원본영역으로 순간이동시킬 때 끊김 현상이 발생하는 것 해결

### 3. 4주차 해야하는 일들
- [ ] vite 이용해서 빌드 개발환경 구축하기
- [ ] 기존에 개발했던 코드 vite로 이전하기
- [ ] fetch API로 렌더링을 통한 카드형 콘텐츠 데이터 가져오기
- [ ] 좋아요 버튼 구현
- [ ] mock server 환경 구현 및 이해해보기


## 3주차 체크리스트
### 1. 피어피드백 반영 및 전체 개괄
- [x] 2주차 피어피드백 내용 수정
- 탭으로도 슬라이더 이동가능하게 ul > li로 변경
- copilot 피드백 내용 수정
- [x] netflix hero>img 배경 영역 CSS 파일 내용 확인하여 크기 및 그라데이션 반영하도록 수정

- [x] CSS 파일 global 영역과 세부 영역 구분하기

- [x] 적절한 JS entry point 만들어서 필요한 JS 모듈 import하기

### 2. header 영역
- [x] 헤더 영역 호버시 제대로 알림 등의 모달이 표현되는가?

- ### 3. main, hero 영역
- [x] hero 영역의 최대 크기를 지정하여 전체화면에서 과하게 hero 영역이 커지는 현상을 해결했는가?

- [x] 카드형 콘텐츠를 재사용 가능하도록 선언했는가?
- [x] 카드형 콘텐츠 위에 버튼을 띄우고 버튼이 동작하도록 했는가?

- [x] 버튼을 눌렀을 때 적절하게 카드가 이동하는 애니메이션이 구현되었는가?
- [x] 카테고리별로 카드 개수가 다르게 설정되어있어도 그에 맞게 애니메이션이 작동하는가?
- [x] 적절하고 부드러운 애니메이션 효과가 발생하도록 했는가?
- [x] 무한 캐러셀이 작동하도록 JS 또는 CSS 파일을 이용했는가?

- ### 4. footer 영역


### 5. 학습해볼 지점
DOM 개념 학습, Grid, Flex 사용법 숙지, JS 모듈 불러와서 적절하게 사용하기, CSS와 JS를 써야하는 지점을 구분하기, DOM event 개념 학습, JS 적절히 활용하기