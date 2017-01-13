
	//웹소켓 접속하기
	var socket=io.connect();
	
	socket.on("connect", function(){
		socket.emit("getFileList");
	});

	//도착한 코드의 숫자와 파일 업로드 숫자 
	var clipCount=0;
	var fileCount=0;
	var isFileTab=false;

	//현재페이지 
	var currentPage=0;
	if(localStorage){
		if(localStorage.seq==undefined){
			localStorage.seq=0;
		}
	}
	
	//코드 출력하는 함수. 
	function printCode(data){
		$(".prettyprint").removeClass("prettyprinted");
		$(".prettyprint").html(data);
		$("<script/>").attr("src","https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js?lang=css")
		.appendTo("head");
	}
	socket.on("getCode", function(data){
		clipCount++;
		$("#clipBadge").text(clipCount);

		var escapedData=_.escape(data);
		printCode(escapedData);
		
		//로칼 스토리지에 저장하기
		var page = ++localStorage.seq; //저장할 페이지 
		var database;
		if(localStorage.codeHistory==undefined){
			database={};
		}else{
			database=JSON.parse(localStorage.codeHistory);
		}
		database[page]=escapedData; //{ 1:"code", 2: "code"};
		localStorage.codeHistory=JSON.stringify(database);
		currentPage=localStorage.seq;
		$("#pageSpan").text(currentPage);
	});
	socket.on("goLink", function(data){
		//data 는 이동할 링크이다
		$("#modalLink").attr("href",data).text(data);
		$("#linkModal").modal();
	});
	//파일목록 업데이트 이벤트 처리 
	socket.on("updateFileList", function(data){
		$("#fileBody tr").detach();
		for(var i in data){
			var tmp=data[i];
			var id=tmp.id;
			var orgFileName=tmp.orgFileName;
			var title=tmp.title;
			var a = $("<a/>")
			.attr("href","/board/download?id="+id)
			.text(orgFileName);
			var td1=$("<td/>").text(id);
			var td2=$("<td/>").html(a);
			var td3=$("<td/>").text(title);
			$("<tr/>").append(td1).append(td2).append(td3).appendTo("#fileBody");
		}
	});
	
	//파일 업로드 이벤트 
	socket.on("newFile",function(){	
		if(!isFileTab){
			fileCount++;
			$("#fileBadge").text(fileCount);
		}
		//새로운 파일 목록을 달라고 이벤트 발생 시키기 
		socket.emit("getFileList");
	});
	socket.on("fileupReset",function(){
		$("#fileBody tr").remove();
	});
	$(document).on("click","#alink", function(){
		$(this).detach();
	});
	
	//페이지 로딩이 완료되었을때 할 준비 작업 
	$(function(){
		$(".prettyprint").click(function(){
			$("#clipBadge").text("");
			clipCount=0;
		});
		$("#fileTab").click(function(){
			isFileTab=true;
			fileCount=0;
			$("#fileBadge").text("");
		});
		$("#clipTab").click(function(){
			isFileTab=false;
		});
		$("#pageSpan").text(currentPage);
		 $("#copyBtn").zclip({
			 	path:"js/ZeroClipboard.swf",
			 	copy:function(){
			 		$("#clipBadge").text("");
			 		clipCount=0;
			 		return $(".prettyprint").text();
			 	}
		 });
		 $("#fontSize").change(function(){
		 	var value=$(this).val();
		 	$(".prettyprint").css("font-size",value+"px");
		 });
	});
	
	//클리어 버튼을 눌렀을때 
	function clearScreen(){
		//삭제 
		$(".prettyprint").html("");
	}
	
	function getCurrentCode(){
		socket.emit("getCurrentCode");
	}
	function before(){
		currentPage--;
		if(currentPage<=0){
			alert("이전 페이지는 없습니다.");
			currentPage++;
			return;
		}
		var database=JSON.parse(localStorage.codeHistory);
		var data = database[currentPage];
		printCode(data);
		$("#pageSpan").text(currentPage);
	}
	function after(){
		currentPage++;
		if(currentPage>localStorage.seq){
			alert("다음 페이지는 없습니다.");
			currentPage--;
			return;
		}
		var database=JSON.parse(localStorage.codeHistory);
		var data = database[currentPage];
		printCode(data);
		$("#pageSpan").text(currentPage);
	}
	function deleteHistory(){
		//var isDelete=confirm("히스토리를 삭제하시겠습니까?");
		$("#confirmMsg").text("히스토리를 삭제하시겠습니까?");
		$("#confirmModal").modal();
	}
	function clearHistory(){
		delete localStorage.codeHistory;
	 	delete localStorage.seq;
	 	localStorage.seq=0;
	 	$("#pageSpan").text(0);
	 	$(".prettyprint").html("");
	}