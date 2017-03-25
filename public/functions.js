$(function(){
    var socket = io();
    var getUserInterval;
    var username;
    var opponent;

    $("#getUser").submit(function(){
        if($("#name").val().trim() == ''){
            alert("You must enter a name to play.");
        } else {
            socket.emit("player enter", $("#name").val(), function(data){
                if(!data){
                    $("#invalid-name-error").css("display", "block");
                } else {
                    username = $("#name").val();
                    $("#username").html("User: " + username);
                    $("#username").css("visibility", "visible");
                    $("#invalid-name-error").css("display", "none");
                    $("#greeting").html("Welcome " + $("#name").val() + "!");
                    $("#name").val("");
                    hideTitleScreen();
                    showMenu();
                }
            });
        }
        return false;
    });

    $("#joinGame").click(function(){
        socket.emit("join game");
    });

    socket.on("in que", function(){
        hideMenu();
        showWaiting();
    });

    socket.on("joined room", function(name){
        opponent = name;
        hideWaiting();
        hideMenu();
        showLobby();
        createBoard();
    });

    socket.on("chat message", function(msg){
        $("#messages").append("<li><b>" + opponent + ":</b> "+ msg + "</li>");
        scrollToBottom();
    });

    $("#msgInput").submit(function(){
        if($("#msg").val().length > 0){
            socket.emit("chat message", $("#msg").val());
            $("#messages").append("<li><b>" + username + ":</b> "+ $("#msg").val() + "</li>");
            $("#msg").val("");
            scrollToBottom();
        }
        return false;
    });

    $("#leaveQue").click(function(){
        socket.emit("leave que");
        hideWaiting();
        showMenu();
    });

    $("#exitMenu").click(function(){
        socket.emit("exit menu");
        $("#username").html("User: n/a");
        $("#username").css("visibility", "hidden");
        hideMenu();
        showTitleScreen();
    });

    function createBoard(){
        var board = "<table style='border: solid 10px'>";

        for(row = 0; row < 8; row++){
            board += "<tr>";

            for(col = 0; col < 8; col++){
                if(((row % 2 == 0) && (col % 2 == 1)) || ((row % 2 == 1) && (col % 2 == 0))){
                    board +="<td style='background-color: black'></td>";
                } else {
                    board +="<td style='background-color: red'></td>";
                }
            }
            board +="</tr>";
        }
        board +="</table>";

        $("#game").append(board);
    }

    function showLobby(){
        $("#gameLobby").css("display", "block");
    }

    function hideLobby(){
        $("#gameLobby").css("display", "none");
    }

    function showWaiting(){
        $("#waiting").css("display", "block");
    }

    function hideWaiting(){
        $("#waiting").css("display", "none");
    }

    function showMenu(){
        $("#gameMenu").css("display", "block");
        getUsersOnline();
        getUserInterval = setInterval(getUsersOnline, 5000);
    }

    function hideMenu(){
        $("#gameMenu").css("display", "none");
        clearInterval(getUserInterval);
    }

    function showTitleScreen(){
        $("#getUser").css("display", "block");
    }

    function hideTitleScreen(){
        $("#getUser").css("display", "none");
    }

    function getUsersOnline(){
        socket.emit("get users online", function(data){
            $("#usersOnline").html("Users Online: " + data);
        });
    }

    function scrollToBottom(){
        $("#msgBox").scrollTop($("#msgBox").prop("scrollHeight"));
    }

});
