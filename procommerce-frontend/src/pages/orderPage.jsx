import React, {useState,useEffect} from 'react'
import axios from "axios"
import { PayPalButton } from "react-paypal-button-v2";
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, payOrder } from "../redux/actions/orderActions";

const OrderPage = ({match}) => {
    const [sdkReady, setSdkReady] = useState(false)
    const orderId = match.params.id

    const dispatch = useDispatch()
  
    const orderDetails = useSelector((state) => state.orderDetails)
    const { order, loading, error } = orderDetails

    const orderPay = useSelector(state => state.orderPay)
    const { success:successPay, loading:loadingPay } = orderPay
  
    if (!loading) {
      const addDecimals = (num) => {
        return (Math.round(num * 100) / 100).toFixed(2)
      }
  
      order.itemsPrice = addDecimals(
        order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      )
    }
  
    useEffect(() => {
      const addPaypalScript = async () => {
        const {data: clientId } = await axios.get("/config/paypal")
        const script = document.createElement("script")
        script.type = "text/javascript"
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
        script.async = true
        script.onload = () => {
          setSdkReady(true)
        }
        document.body.appendChild(script)
      }

      if(!order || successPay){
        dispatch({
          type: "ORDER_PAY_RESET"
        })
        dispatch(getOrderDetails(orderId))
      }else if(!order.isPaid){
        if(!window.paypal){
          addPaypalScript()
        }else{
          setSdkReady(true)
        }
      }
    }, [dispatch, orderId, order, successPay])

    const successPaymentHandler = (paymentResult) => {
      console.log(paymentResult)
      dispatch(payOrder(orderId, paymentResult))
    }
  
    return loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p>{error}</p>
    ) : (
      <>
        <h1>Order {order._id}</h1>
        <Row>
          <Col md={8}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Shipping</h2>
                <p>
                  <strong>Name: </strong> {order.user.name}
                </p>
                <p>
                  <strong>Email: </strong>{' '}
                  <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                </p>
                <p>
                  <strong>Address:</strong>
                  {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <p>
                    Delivered on {order.deliveredAt}
                  </p>
                ) : (
                  <p>Not Delivered</p>
                )}
              </ListGroup.Item>
  
              <ListGroup.Item>
                <h2>Payment Method</h2>
                <p>
                  <strong>Method: </strong>
                  {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <p>Paid on {order.paidAt}</p>
                ) : (
                  <p>Not Paid</p>
                )}
              </ListGroup.Item>
  
              <ListGroup.Item>
                <h2>Order Items</h2>
                {order.orderItems.length === 0 ? (
                  <p>Order is empty</p>
                ) : (
                  <ListGroup variant='flush'>
                    {order.orderItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col>
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                          </Col>
                          <Col md={4}>
                            {item.qty} x ${item.price} = ${item.qty * item.price}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Order Summary</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>${order.totalPrice}</Col>
                  </Row>
                </ListGroup.Item>
                {
                  loadingPay && <h3>Loading...</h3>
                }
                {
                  !sdkReady ? <h3>Loading...</h3> : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )
                }
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </>
    )
}

export default OrderPage
