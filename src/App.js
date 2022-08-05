import './App.css';
//1. npm i @octokit/graphql 명령어로 설치
//2. grapql을 import
import { graphql } from '@octokit/graphql';
import { useEffect, useState } from 'react';
import myToken from './my_token';

// @octokit/graphql 기본 사용법은 여기 https://github.com/octokit/graphql.js/
//3. graphql은 await 붙는 함수다 보니까 async를 붙여줘야 한다. -> 함수로 따로 만들어준다.
async function getRepository() {
  const { repository } = await graphql(
    `
    {
      repository(name: "agora-states-fe", owner: "codestates-seb") {
        discussions(first: 100) {
          edges {
            node {
              id
              title
              createdAt
              url
              author {
                login
                avatarUrl
              }
              answer {
                author {
                  login
                  avatarUrl
                }
              }
              category {
                name
              }
            }
          }
        }
      }
    }
    `,
    {
      headers: {
        // 4. 여기 https://github.com/settings/tokens/ 로 가서 access token 을 받아온다.
        //    발급받은 토큰을 아래에 넣는다. (내 경우, 따로 파일에서 import 시켰다.)
        authorization: `token ${myToken.access}`,
      },
    }
  );

  console.log(repository);
  // 5. 따로 빼준 함수이기 때문에 여기서 만들어진 값을 사용하려면 return 시켜줘야한다.
  return repository; //필요한 값만 빼오기
}

//10. 받아온 데이터를 보여줄 컴포넌트를 만든다.
const Discussions = ({ discussions }) => {
  return (
    <section className='discussions--wrapper'>
      <ul>
        {discussions.map(discussion => (
          <li key={discussion.node.id}>
            <div>
              <img 
                src={discussion.node.author.avatarUrl} 
                alt={discussion.node.author.login}
              />
            </div>
            <div className='discussion--content--wrapper'>
              <div>{discussion.node.category.name}</div>
              <div>
                <a href={discussion.node.url}>{discussion.node.title}</a>
              </div>
              {/* 시간을 new Date 안에 넣으면 내 컴퓨터 위치에 따른 시간형식으로 변경,
              .toLocaleDateString() 는 위치한 지역에 맞게 날짜 표시 */}
              <div>{new Date(discussion.node.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              {discussion.node.answer === null ? "⬜️" : "✅" }
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}



function App() {
  const [discussions, setDiscussions] = useState({});

  // 6. 외부 API 요청 = side Effect 이므로 useEffect 에서 처리
  //    컴포넌트 마운트시 한번만 받아올 것이기 때문에 의존성 배열에 []을 넣는다.
  useEffect(() => {
    //7. async 함수는 promise를 반환한다. 따라서 리턴값을 쓰려면 .then 을 활용해야한다.
    getRepository()
    .then((data) => {
      //8. 받아온 데이터를 넣어줄 state를 만들어서 data를 할당해준다.
      setDiscussions(data.discussions);
    }).catch((err) => {
      console.log(Error, err);
    })
  }, [])


  return (
    <div className="App">
      <header>
        <h1>My Agora State</h1>
      </header>
      <main>
        {/* 9. 데이터를 비동기적으로 받아오기 때문에 처음에는 빈객체{} 이므로 빈객체 일때를 처리해줘야한다. */}
        {discussions.edges === undefined ? 
        <div>Loading...</div>
        : <Discussions discussions={discussions.edges} />}
      </main>
      <footer>
      &copy; nuuco by codestates.
      </footer>
    </div>
  );
}

export default App;
