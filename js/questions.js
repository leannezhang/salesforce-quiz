/**
 * Created by liyangzhang on 15-03-29.
 */

// Score variables
var $questionNum = 1; //Number of questions so far
var $correctAnswers = 0;
var $totalQuestions = 0;
var xmlDoc;
var questionParent;


// When document is ready
$(document).ready(function() {

    $.ajax({
        type : "GET",
        url : "res/questions/questions.xml",
        dataType : "xml",
        success : function(data) {
            xmlDoc = data;
        }
    }).done(function() {

        $totalQuestions = $(xmlDoc).find("qa").length;
        displayQuestion();

    }).fail(function(jqXHR, textStatus) {
        console.log(jqXHR);
        console.log( textStatus);
        alert("Error");
    });

});


function displayQuestion() {

    // Before loading the question, clear previous question
    $('.choices').html(""); //clear html content in <div class="list-group choices" />
    $('.nextButton').remove(); // remove the nextButton


    // get the first questionParent
    questionParent = $(xmlDoc).find('qa')[$questionNum - 1];

    if ($questionNum <= $totalQuestions )
    {

        // 1. Display heading
        $("#questionLabel").text(
            "Question " + $questionNum + " of " + $totalQuestions);

        // 2. Display question text
        $('.question').text($(questionParent).find('question').text());

        // 3. Store all the choices in an array
        var choices = $(questionParent).find('choice');

        // 4. Determine question type either multi-selected question or single-choice question
        var $questionType = $(questionParent).attr("type");

        //
        //  Multi-selected questions
        //
        if ($questionType == 'ms')
        {

            createMultiSelectQuestion(choices);
            displayButton();

        }

        //
        //   Single-choice question
        //

        else if ($questionType == 's')
        {

            createSingleSelectQuestion(choices);
            displayButton();

        }

    }


    //
    //  No questions left
    //

    else
    {
        $('.question-parent').hide();
        $('.result').show();

        //after retry
        $('.retry')[0].onclick = function() {
            $questionNum = 1;
            displayQuestion();
            $('.question-parent').show();
            $('.result').hide();
            $('.score').text('');
            $('.scoreText').hide();
            $correctAnswers = 0;
        }
    }
}

function createSingleSelectQuestion(choices) {

    for ( var i = 0; i < choices.length; i++) {

        var choice = $(choices[i]);
        var choiceElem = document.createElement('a'); // <a></a>
        var choiceKey = choice.attr('key');
        choiceElem.setAttribute('id', choiceKey); // <a id='$choiceKey'></a>
        choiceElem.innerHTML = choiceKey + ": " + choice.text(); // <a id='$choiceKey'>$choiceKey: $choiceText</a>
        choiceElem.setAttribute('class',
            'list-group-item choice'); // <a id='$choiceKey' class='list-group-item choice'>$choiceKey: $choiceText</a>


        choiceElem.onclick = function() {

            checkAnswer(this.getAttribute('id'), questionParent);

        }

        $('.choices').append(choiceElem);
    }

}

function createMultiSelectQuestion(choices) {

    var msDiv = document.createElement('div');
    msDiv.setAttribute('class', 'btn-group-vertical');
    msDiv.setAttribute('data-toggle', 'buttons');
    $('.choices').append(msDiv);

    var localCorrectAnswer = 0;


    // Display answer choices
    // Allow users to multiple select answers

    for ( var i = 0; i < choices.length; i++) {
        var choice = $(choices[i]);
        var choiceElem = document.createElement('label');
        var choiceKey = choice.attr('key');
        choiceElem.setAttribute('id', choiceKey);
        choiceElem.setAttribute('class', 'btn btn-default');
        var chkbox = document.createElement('input');
        chkbox.setAttribute('type', 'checkbox');
        msDiv.appendChild(choiceElem);
        choiceElem.appendChild(chkbox);
        var choiceText = document.createTextNode(choiceKey + ": " + choice.text()); // look into create textNode
        choiceElem.appendChild(choiceText);

        // Every time a choice element is click,
        // Check to see if this key is part of the answer keys
        choiceElem.onclick = function() {

            localCorrectAnswer =  checkMultipleAnswers(this.getAttribute('id'), questionParent, localCorrectAnswer);
            console.log(localCorrectAnswer);
        }
    }

}


function checkMultipleAnswers(key, questionParent, localCorrectAnswer) {

    // Remove the onclick attribute and remove the listener to click for choices
    $('.choice').attr('onclick', '').unbind('click');

    var answerKeys = $(questionParent).find('answer').attr('key');
    var localCorrectAnswer = localCorrectAnswer;

    if (answerKeys.indexOf(key) > -1 ) {
        $('#' + key).css("background-color", "lightgreen");
        localCorrectAnswer +=1;

        if (localCorrectAnswer == answerKeys.length) {
            $correctAnswers += 1;
            updateScore();
        }
    } else {
        $('#' + key).css("background-color", "orange");
    }

    return localCorrectAnswer;
}

function checkAnswer(key, questionParent) {
    // Remove the onclick attribute and remove the listener to click for choices
    $('.choice').attr('onclick', '').unbind('click');

    if ($(questionParent).find('answer').attr('key') == key) {
        $('#' + key).css("background-color", "lightgreen");
        $correctAnswers += 1;
    } else {
        $('#' + key).css("background-color", "orange");
    }
    updateScore();
}

function displayButton() {

    var inputElem = document.createElement('input');
    inputElem.setAttribute('type', 'button');
    inputElem.setAttribute('value', 'Next Question >');
    inputElem.setAttribute('class', 'nextButton btn');
    inputElem.onclick = function() {
        $questionNum += 1;
        displayQuestion();
    }
    var questionParent = document
        .getElementsByClassName("question-parent")[0];
    questionParent.appendChild(inputElem); // <input type="button" value="Next Question" class="nextButton" onclick="msg()"  />

}

function updateScore() {
    var score = parseInt(($correctAnswers / $questionNum) * 100);
    $(".scoreText").show();
    $(".score").text(score + "%");
}