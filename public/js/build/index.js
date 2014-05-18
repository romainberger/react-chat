/** @jsx React.DOM */

!function(React, Router) {
  var container = document.createElement('div')
  container.id = 'container'
  container.className = 'container'
  document.querySelector('body').appendChild(container)

  var socket    = io.connect('http://localhost:3000')
    , container = document.querySelector('#container')

  var Index = React.createClass({displayName: 'Index',
    render: function() {
      return (
        React.DOM.div( {className:"index"}, 
          React.DOM.h1(null, "React chat"),
          React.DOM.p(null, React.DOM.a( {href:"/chat"}, "Enter the chat"))
        )
      )
    }
  })

  var CommentBox = React.createClass({displayName: 'CommentBox',
    getInitialState: function() {
      var self = this
      socket.on('new:comment', function(comment) {
        var comments = self.state.data
          , newComments = comments.concat(comment)
        self.setState({data: newComments})
      })

      socket.on('init', function(comments) {
        self.setState({data: comments})
      })

      socket.emit('init')

      return {data: []}
    },
    handleNewComment: function(comment) {
      socket.emit('new:comment', comment)
    },
    render: function() {
      return (
        React.DOM.div( {className:"commentBox"}, 
          React.DOM.h1(null, "Chat room"),
          React.DOM.p(null, React.DOM.a( {href:"/"}, "Homepage")),
          CommentForm( {onHandleSubmit:this.handleNewComment} ),
          CommentList( {data:this.state.data} )
        )
      )
    }
  })

  var CommentForm = React.createClass({displayName: 'CommentForm',
    handleSubmit: function() {
      var name = this.refs.name.getDOMNode().value
        , text = this.refs.comment.getDOMNode().value

      this.refs.comment.getDOMNode().value = ''
      this.props.onHandleSubmit({name: name, comment: text, date: Date.now()})

      return false
    },
    render: function() {
      return (
        React.DOM.form( {className:"commentForm", onSubmit:this.handleSubmit}, 
          React.DOM.input( {type:"text", placeholder:"name", ref:"name"} ),
          React.DOM.input( {type:"text", ref:"comment"} ),
          React.DOM.input( {type:"submit"} )
        )
      )
    }
  })

  var CommentList = React.createClass({displayName: 'CommentList',
    render: function() {
      var comments = this.props.data.map(function(comment) {
        return Comment( {name:comment.name, comment:comment.comment, date:comment.date} )
      })

      return (
        React.DOM.div(null, 
          comments
        )
      )
    }
  })

  var Comment = React.createClass({displayName: 'Comment',
    render: function() {
      var date = new Date(this.props.date)
        , now = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
      return (
        React.DOM.div( {className:"comment"}, 
          now, " ", React.DOM.strong(null, this.props.name), " - ", this.props.comment,
          React.DOM.hr(null )
        )
      )
    }
  })

  var map = {
    index: function() {
      React.renderComponent(
        Index(null ),
        container
      )
    },
    chat: function(match) {
      React.renderComponent(
        CommentBox(null ),
        container
      )
    }
  }

  var routes = {
        '/': map.index,
        '/chat': map.chat
      }
    , options = {
        html5history: true
      }

  var router = Router(routes).configure(options)
  router.init()

}(window.React, window.Router)
