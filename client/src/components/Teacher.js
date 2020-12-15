// filtro fatto su courseName invece che coureId, se cancelli tutte le lezioni 
// scompare la tab

import React from "react";
import moment from "moment";
import Pagination from 'react-bootstrap/Pagination'
import  { Redirect } from 'react-router-dom'
import {
  Col,
  Container,
  Row,
  Tabs,
  Tab,
  ListGroup,
  Button,
} from "react-bootstrap";
import { AuthContext } from "../auth/AuthContext";
import API from ".././API/API";
import DialogAlert from "./DialogAlert"

/*  listaLezione -> getLectures
    corso -> courseId
    lezione -> lectureId
    studenti -> vector of Students


var listaLezioni = [
  {
    corso: "History",
    lezione: "HY-01",
    studenti: new Array("ettore", "carlo", "luca", "camarcorlo"),
  },
  {
    courseId: "History",
    lectureId: "HY-01",
    studenti: new Array("ettore", "carlo", "luca", "camarcorlo"),
  },
  {
    courseId: "Geometry",
    lectureId: "GY-01",
    studenti: new Array("ettore", "carlo"),
  },
  {
    courseId: "History",
    lectureId: "HY-02",
    studenti: new Array("ettore", "camarcorlo"),
  },
  {
    courseId: "Software Engineering 2",
    lectureId: "SE2-01",
    studenti: [],
  },
  {
    courseId: "Software Engineering 2",
    lectureId: "SE2-02",
    studenti: new Array("Marco", "Luca"),
  },
  {
    courseId: "Analisi",
    lectureId: "AI-01",
    studenti: new Array("ludo", "carlo", "max"),
  },
]; */
const view = 5; //number of lectures per pagination

class Teacher extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //lectureUpdated: true,
      totalLectures: [],
      course: '',
      students: [],
      lecture: '',
      studtable: true,
      online: false,
      range: 0,
      user: {},
      
    };
    this.wrapper = React.createRef();
  }


  componentDidMount(){
    this.user();
    this.getLectures(this.context.authUser.userId)
    console.log(this.context.authUser)
    

  }
  user = () => {
    API.isLogged()
      .then((user) => {
        console.log("eccolooo")
        console.log(user);
        this.setState({user : user})
        //this.getLectures(user.userId)
        
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getLectures = (userId) => {
    API.getLecturesStartDate(userId)
      .then((lectures) => {
        console.log("Lezioni")
        console.log(lectures);
        this.setState({
          totalLectures: lectures || [],
        });
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
  };

  getStudentsBooked(lectureId, online) {
    API.getStudentsBooked(lectureId)
      .then((students) => {
        console.log("studenti")
          console.log(students);
        this.setState({
          students: students.students || [],online: online
        });
      })
      .catch((errorObj) => {
        console.log('no');
        console.log(errorObj);
      });
  }

  //delete a lecture as teacher
  deleteLecture(lectureId) {
    console.log(lectureId);
    API.deleteLecture(lectureId)
      .then(() => {
        //this.setState({totalLectures : this.state.totalLectures.filter(c => c.lectureId !== lectureId)});
        //this.setState({lectureUpdated: true})
        this.getLectures(this.context.authUser.userId)
        //aggiunto io
        this.setState({students : []});
        this.setState({studtable: false});
      })
      .catch((errorObj) => {
        console.log(errorObj);
      });
      //console.log("prima");
      //console.log(this.state.totalLectures);
      //console.log(this.state.students);
      //await this.setState({totalLectures : this.state.totalLectures.filter(c => c.lectureId !== lectureId)});
      //await this.setState({students : []})
      //console.log("dopo");
      //console.log(this.state.totalLectures);
      //console.log(this.state.students);
      
  }

  updateLectures(userId) {
    //if (this.state.lectureUpdated) {
    //  this.setState({ lectureUpdated: false });
      this.getLectures(userId);
    //}
  }

  clearStudentTable() {
    this.setState({students : []})
  }

  turnLecture(lectureId,online_s){
    //chiamata API per modificare stato lezione online/in presence
    API.turnLecture(lectureId,online_s)
    .then(() => {
      //andato a buon fine
      console.log("giusto")
      this.getLectures(this.context.authUser.userId)
      //aggiunto io
      
    })
    .catch((errorObj) => {
      console.log("errore")
      console.log(errorObj);
    });}

   
    
    //this.state.totalLectures.filter(l => l.lectureId === lectureId).online = !this.state.totalLectures.filter(l => l.lectureId === lectureId).online;
  /*
    if(online){
      this.setState({online: false});
    }
    else{
      this.setState({online: true});
    }
    */
   changeRange(x,courseId){
     console.log(x);
     var range=this.state.range; //range va da 1 a x in base a quanto seleziono  1->0-9     2->10-19   ecc
     var lung= this.state.totalLectures.filter(l => l.courseName === courseId).length;
     console.log(courseId)
     console.log(lung)
     if(x<0){
       (this.state.range-1)>=0 ? range-- : console.log("non posso -1")   
     }
     else if(x>0){
      (this.state.range+1)<(Math.ceil(lung/view)) ? range++ : console.log("non posso")   
    }
    console.log(range);
     this.setState({range: range});
   }
  

  render() {
    const corsi = this.state.totalLectures
      .map((item) => item.courseName)
      .filter((v, i, s) => s.indexOf(v) === i);
    
    return (
      
      <AuthContext.Consumer>
        {(context) => (
            <>
            {context.authUser ? (
          <>
            

            <Container fluid className="mt-5 ">
              <Row className="justify-content-md-center">
                <h1>Welcome back {this.state.user.firstname+" "+this.state.user.lastname}</h1>
              </Row>

              <Tabs
                defaultActiveKey={this.state.totalLectures[0]?.courseId}
                id="noanim-tab-example"
                onSelect={() => {this.clearStudentTable(); this.setState({range: 0})}}
              >
                {corsi?.map((C_Id) => (
                  <Tab eventKey={C_Id} title={C_Id} key={C_Id}>
                    <Row className="mt-5 ">
                      <Col md={1}></Col>
                      <Col md={5}>
                      <Pagination>
                      
                      <Pagination.Prev onClick={() => this.changeRange(-1,C_Id)} />
                      <Pagination.Item disabled>{this.state.range+1}</Pagination.Item>
                      
                      <Pagination.Next onClick={() => this.changeRange(+1,C_Id)}/>

                    </Pagination>
                        <Tab.Container id="list-group-tabs-example">
                          <ListGroup className="mt-2">
                            <ListGroup.Item as="li" active>
                              <h3>lecture</h3>
                            </ListGroup.Item>

                            {this.state.totalLectures
                              .filter((l) => l.courseName === C_Id)
                              ?.slice(this.state.range*view,this.state.range*view+view)
                              ?.map((c) => (
                                <ListGroup.Item
                                  action
                                  variant={
                                    c.lectureId === this.state.lecture
                                      ? "primary"
                                      : "light"
                                  }
                                  key={c.lectureId}
                                  onClick={() => {
                                    this.setState({
                                      course: c.courseId,
                                      lecture: c.lectureId,
                                      studtable: true,
                                    });
                                    this.getStudentsBooked(c.lectureId,c.online);
                                  }}
                                >
                                  <Row>
                                <Col md={2}>{moment(c.startTS).format("DD/MM/YYYY HH:mm")}</Col><Col>{c.online? "Virtual Lesson":c.roomName}</Col>
                                {   c.online? <></> :
                                  <DialogAlert 
                                  dialog={"turn"}
                                  courseName={C_Id}
                                  startTS={c.startTS}
                                  lectureId={c.lectureId}
                                  onConfirm={(lectureId)=>{this.turnLecture(lectureId)}} />
                                    }
                                    <Col></Col>
                                  
                                  <DialogAlert 
                                  dialog={"delete"}
                                  courseName={C_Id}
                                  startTS={c.startTS}
                                  deleteLecture={this.deleteLecture}
                                  lectureId={c.lectureId}
                                  onConfirm={(lectureId)=>{this.deleteLecture(lectureId)}} />
                                  
                                  </Row>
                                </ListGroup.Item>
                                
                              ))}
                          </ListGroup>
                        </Tab.Container>
                      </Col>
                      <Col md={1}></Col>
                      <Col md={4}>
                      {this.state.studtable?
                        <ListGroup as="ul" className="mt-2">
                            {(this.state.students.length&&!this.state.online)?

                                    <><ListGroup.Item as="li" active>
                                    <h3>students booked</h3>
                                  </ListGroup.Item>
                                    <ListGroup.Item ><h5>number of students:
                                          {" "}{this.state.students.length}</h5>
                                      </ListGroup.Item>
                                      {this.state.students?.map((s) => (
                              <ListGroup.Item as="li" key={s}>
                                {"S"+s.studentId + " - " +s.studentName}
                              </ListGroup.Item>
                            ))}
                                      </>:
                                      <></>
                            }
                            
                          </ListGroup>:
                        <></>
                        }
                      </Col>
                    </Row>
                  </Tab>
                ))}
              </Tabs>
            </Container>
          </>
          ) : (
            <><Redirect to='/login'  /></>
          )}
        </>
        )}
      </AuthContext.Consumer>
    );
  }
} 
Teacher.contextType = AuthContext;


export default Teacher;
