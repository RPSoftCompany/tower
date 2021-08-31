//    Copyright RPSoft 2019,2020. All Rights Reserved.
//    This file is part of RPSoft Tower.
//
//    Tower is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 3 of the License, or
//    (at your option) any later version.
//
//    Tower is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Tower.  If not, see http://www.gnu.org/licenses/gpl-3.0.html.

<template>
  <div>
    <svg
      v-if="value"
      v-resize="onResize"
      style="position:absolute;z-index: 200;pointer-events: none"
      width="100%"
      height="100%"
    >

      <path
        style="pointer-events: fill"
        fill-rule="nonzero"
        stroke="#f2a52a"
        stroke-width="2"
        :fill="`rgba(0,0,0,${fill.opacity})`"
        :d="`M 0,0 h${windowSize.x} v${windowSize.y} h-${windowSize.x} z
          M${innerRect.x} ${innerRect.y} v${innerRect.v} h${innerRect.h} v-${innerRect.v} z
          M${secondInnerRect.x} ${secondInnerRect.y} v${secondInnerRect.v}
            h${secondInnerRect.h} v-${secondInnerRect.v} z`"
      />
    </svg>

    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide one !!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 1">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h3 slide"
        >
          Welcome to the <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >Tower Configuration Server</span> setup process
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide"
        >
          First thing you need to do, is to add the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide"
        >
          To do so, go to the settings menu located in the bottom left corner
        </div>
      </div>

      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:110px;
            top:${slideOne.settingsTop-40}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:60px;top:${slideOne.settingsTop}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide two !!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 2">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide"
        >
          Now choose the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> tab from the upper menu
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;top:${slideTwo.baseModelsTop+40}px;
            left:${slideTwo.baseModelsLeft+115}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideTwo.baseModelsLeft}px;
            top:${slideTwo.baseModelsTop+5}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 2 0 Q 50 50 100 50
                M 2 0 L 5 20
                M 2 2 L 22 2"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide three !!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 3">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h3 slide"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> are the most important entities in <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Tower</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 30%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> describe the way your organisation work
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 50%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          For example, assuming your organization has many applications written using different technologies and located
          on different environments. You should create three <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span>: <span class="font-weight-bold">Environment</span>,
          <span class="font-weight-bold">Technology</span> and <span class="font-weight-bold">Application</span>.
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 70%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          You can find more information about <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> in the <a
            href="https://rpsoft.gitbook.io/tower/user-interface/model"
            target="_blank"
            style="color:#f2a52a"
            class="font-weight-bold font-italic text-decoration-underline"
          >Documentation</a>
          <br><br>
          <v-btn
            class="primary"
            @click="showSlideFour"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide four !!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 4">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          All you need to do to create a new <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> is to type its name into the visible input and click the plus button on the right
          or hit <kbd style="color:#f2a52a">Enter</kbd> key
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;top:${slideFour.baseModelsBottom+50}px;
            left:${slideFour.baseModelsLeft+110}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Type here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideFour.baseModelsLeft}px;
            top:${slideFour.baseModelsBottom+15}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 2 0 Q 50 50 100 50
                M 2 0 L 5 20
                M 2 2 L 22 2"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideFour.baseModelsRight+80}px;
            top:${slideFour.baseModelsTop-75}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Then click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideFour.baseModelsRight+60}px;
            top:${slideFour.baseModelsTop-35}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide five !!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 5">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h3 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Good job !!!</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          You've created your first <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Model</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 80%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Now create all the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> you need
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide six !!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 6">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          When you are done creating your <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span>, go to the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Model</span> menu on your left
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideSix.baseModelsLeft+50}px;
            top:${slideSix.baseModelsTop-70}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideSix.baseModelsLeft}px;
            top:${slideSix.baseModelsTop-30}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide seven !!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 7">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Models</span> are the instances of your configuration
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          For example, if your <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Model</span> is called <span class="font-weight-bold">Environment</span>, you may want to create
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Models</span> like <span class="font-weight-bold">Development</span>,
          <span class="font-weight-bold">Test</span> and <span class="font-weight-bold">Production</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          You can find more information about the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Models</span> in the <a
            href="https://rpsoft.gitbook.io/tower/user-interface/model"
            target="_blank"
            style="color:#f2a52a"
            class="font-weight-bold font-italic text-decoration-underline"
          >Documentation</a>
          <br><br>
          <v-btn
            class="primary"
            @click="showSlideEight"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide eight !!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 8">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          All you need to do to create a new <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Model</span> for given <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Model</span>, is to type its name into the visible input and click the plus button on the right
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;top:${slideEight.baseModelsBottom+50}px;
            left:${slideEight.baseModelsLeft+110}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Type here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideEight.baseModelsLeft}px;
            top:${slideEight.baseModelsBottom+15}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 2 0 Q 50 50 100 50
                M 2 0 L 5 20
                M 2 2 L 22 2"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideEight.baseModelsRight+80}px;
            top:${slideEight.baseModelsTop-75}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Then click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideEight.baseModelsRight+60}px;
            top:${slideEight.baseModelsTop-35}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide nine !!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 9">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 30%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h3 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Good job !!!</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 50%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Now go to the other <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Model</span>
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideNine.baseModelsLeft+100}px;
            top:${slideNine.baseModelsTop-75}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideNine.baseModelsLeft+60}px;
            top:${slideNine.baseModelsTop-35}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide ten !!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 10">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 50%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Create a new <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Model</span> instance
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide eleven !!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 11">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Great !!!</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          You've created the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Model</span> for each <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Model</span><br>
          This means, you're ready to create your first configuration
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 70%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Now click on the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration</span> menu in the upper left corner of the screen
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideEleven.baseModelsLeft+90}px;
            top:${slideEleven.baseModelsTop+75}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideEleven.baseModelsLeft+50}px;
            top:${slideEleven.baseModelsTop+10}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 10 Q 100 10 100 60
              M 0 11 L 20 0
              M 0 9 L 20 20"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twelve !!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 12">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration</span> page gives you the ability to create a unique configuration for any application / system
          / tool you imagine
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-center slide"
        >
          <v-btn
            class="primary"
            @click="showSlideThirteen"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide thirteen !!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 13">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          First, you need to use the dropdowns to choose the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Configuration Models</span> for your configuration
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Lets start with the first one
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide fourteen !!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 14">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Good !!!</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Lets do the same for the others
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide fifteen !!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 15">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Your first configuration will be created for the following set of <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span>:
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 30%"
      >
        <div
          v-for="key in baseItems"
          :key="key"
          style="position: relative; left: -50%;opacity: 0; line-height: 1.6"
          class="text-h4 slide text-center"
        >
          <div v-if="bases[key]">
            <span
              style="color:#f2a52a"
              class="font-weight-bold"
            >{{ bases[key].base }}</span>: <span
              class="font-weight-bold"
            >{{ bases[key].name }}</span>
          </div>
        </div>
        <br>
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-center slide"
        >
          <v-btn
            class="primary"
            @click="showSlideSixteen"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide sixteen !!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 16">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          As you're creating this configuration for the first time, you'll need to add the configuration variables
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 50%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Those variables are the part of your configuration. For example, while configuring the web server you
          would want to setup the host and port for it. So in that case, you would create <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >host</span> and <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >port</span> variables in <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >Tower</span>.
        </div>
        <br>
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <v-btn
            class="primary"
            @click="showSlideSeventeen"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide seventeen !!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 17">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          To do so, just type the name of your variable in the highlighted input and press the
          <kbd style="color:#f2a52a">+</kbd> button on the right side of the screen
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideSeventeen.svgLeft + 30}px;
            top:${slideSeventeen.svgTop-100}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Type here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideSeventeen.svgLeft-40}px;
            top:${slideSeventeen.svgTop-120}px`"
          width="60"
          height="110"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 23 110 Q 20 70 59 50
              M 8 90 L 23 108
              M 23 108 L 37 90"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideSeventeen.svgRight - 250}px;
            top:${slideSeventeen.svgTop-80}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Then click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideSeventeen.svgRight - 70}px;
            top:${slideSeventeen.svgTop-65}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 90 59 Q 60 0 3 3
              M 68 45 L 90 59
              M 89 59 L 95 40"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide eighteen !!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 18">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Good job !!!</span>
          <br>
          Lets add another one
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide nineteen !!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 19">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Great !!!</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          You've got your configuration variables created, but they lack values
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          To set them, you will need to switch the view to the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Edit mode</span> using the button on the right side of the screen
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideNineteen.svgRight - 170}px;
            top:${slideNineteen.svgTop-80}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideNineteen.svgRight - 50}px;
            top:${slideNineteen.svgTop-65}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 90 59 Q 60 0 3 3
              M 68 45 L 90 59
              M 89 59 L 95 40"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twenty !!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 20">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Now fill up the configuration values and click the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Save configuration</span> button
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twenty one !!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 21">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Congratulations !!!</span>
          <br><br>
          You've created your first configuration in <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Tower</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 40%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Right now you may wonder '<span style="font-style: italic; color:#f2a52a">If
            the configuration is created, then how to obtain it?'</span>'
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 65%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          It's simple. We need to set it up in the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Rest configuration</span> in <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Settings</span> menu
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:110px;
            top:${slideOne.settingsTop-40}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:60px;top:${slideOne.settingsTop}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3 50 Q 100 50 100 0
              M 0 51 L 20 40
              M 0 49 L 20 60"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide Twenty two !!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 22">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide"
        >
          Now choose the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >REST Configuration</span> tab from the upper menu
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;top:${slideTwentyTwo.restTop+40}px;
            left:${slideTwentyTwo.restLeft+115}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideTwentyTwo.restLeft}px;
            top:${slideTwentyTwo.restTop+5}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 2 0 Q 50 50 100 50
                M 2 0 L 5 20
                M 2 2 L 22 2"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twenty three !!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 23">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 10%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          Now you need to add the URL via which you will be obtaining the configuration.
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 30%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          This URL will allow <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Tower</span> to find the configuration you're looking for. For example, assuming your <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Base Models</span> are <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >Project</span>, <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >Environment</span> and <span
            class="font-weight-bold"
            style="color:#f2a52a"
          >Application</span>, you may want to create URL like this: <span class="font-weight-bold font-italic">'{<span
            class="font-weight-bold font-italic"
            style="color:#f2a52a"
          >Project</span>}/{<span
            class="font-weight-bold font-italic"
            style="color:#f2a52a"
          >Environment</span>}/{<span
            class="font-weight-bold font-italic"
            style="color:#f2a52a"
          >Application</span>}'</span>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          In that case, using url <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >/Project_ABC/Staging/Application_A</span> will give you configuration for
          <span class="font-weight-bold font-italic">
            Project</span> <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Project_ABC</span>, <span class="font-weight-bold font-italic">Environment</span> <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Staging</span> and <span class="font-weight-bold font-italic">Application</span> <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Application_A</span>
        </div>
        <br>
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <v-btn
            class="primary"
            @click="showSlideTwentyFour"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twenty four !!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 24">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 60%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          To add a new <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >URL</span>,
          just type it in the highlighted input and press the <kbd style="color:#f2a52a">+</kbd> button
        </div>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideTwentyFour.inputLeft+180}px;
            top:${slideTwentyFour.inputTop-95}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Type here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideTwentyFour.inputLeft+100}px;
            top:${slideTwentyFour.inputTop-85}px`"
          width="80"
          height="70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 13 69 Q 13 0 69 5
              M 3 49 L 13 69
              M 13 69 L 24 49"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
      <div
        class="slide"
        :style="`opacity: 0;position:absolute; z-index: 201`"
      >
        <div
          :style="`position:absolute; z-index: 201;left:${slideTwentyFour.inputRight-260}px;
            top:${slideTwentyFour.inputTop-100}px;color:white;width:200px`"
          class="text-h5 font-weight-bold"
        >
          Then click here
        </div>
        <svg
          :style="`position:absolute; z-index: 201;left:${slideTwentyFour.inputRight-80}px;
            top:${slideTwentyFour.inputTop-85}px`"
          width="110"
          height="60"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 90 59 Q 60 0 3 3
              M 68 45 L 90 59
              M 89 59 L 95 40"
            stroke="#f2a52a"
            stroke-width="4"
            fill="transparent"
          />
        </svg>
      </div>
    </div>
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!! Slide twenty five !!!!!!!!!!!!!! -->
    <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
    <div v-if="slideId === 25">
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 20%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
          v-html="slideTwentyFive.url"
        />
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 50%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          And that is all for the <span
            style="color:#f2a52a"
            class="font-weight-bold"
          >Towers</span> tutorial.<br>
          Remember, you can read more about the configuration and features in the <a
            href="https://rpsoft.gitbook.io/tower"
            target="_blank"
            style="color:#f2a52a"
            class="font-weight-bold font-italic text-decoration-underline"
          >Documentation</a>
        </div>
      </div>
      <div
        style="color:white;z-index:201;position: absolute;left: 50%;top: 80%"
      >
        <div
          style="position: relative; left: -50%;opacity: 0"
          class="text-h4 slide text-center"
        >
          <v-btn
            class="primary"
            @click="$emit('input', false)"
          >
            Finish
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Tutorial',
    props: {
      value: {
        type: Boolean,
        required: true
      }
    },
    data: () => ({
      windowSize: {
        x: 0,
        y: 0
      },
      innerRect: {
        x: 0,
        y: 0,
        v: 0,
        h: 0
      },
      secondInnerRect: {
        x: 0,
        y: 0,
        v: 0,
        h: 0
      },
      lastBaseModel: 0,
      lastSlide: 0,
      bases: null,
      baseItems: [],
      fill: {
        opacity: 0
      },
      slideId: 0,
      slideOne: {
        settingsTop: 0
      },
      slideTwo: {
        baseModelsTop: 0,
        baseModelsLeft: 0
      },
      slideFour: {
        baseModelsTop: 0,
        baseModelsLeft: 0,
        baseModelsRight: 0
      },
      slideSix: {
        baseModelsTop: 0,
        baseModelsLeft: 0
      },
      slideEight: {
        baseModelsLeft: 0,
        baseModelsTop: 0,
        baseModelsBottom: 0,
        baseModelsRight: 0
      },
      slideNine: {
        baseModelsLeft: 0,
        baseModelsTop: 0
      },
      slideEleven: {
        baseModelsLeft: 0,
        baseModelsTop: 0
      },
      slideSeventeen: {
        svgTop: 0,
        svgLeft: 0,
        svgRight: 0
      },
      slideNineteen: {
        svgTop: 0,
        svgRight: 0
      },
      slideTwentyTwo: {
        restTop: 0,
        restLeft: 0
      },
      slideTwentyFour: {
        inputLeft: 0,
        inputTop: 0,
        inputRight: 0
      },
      slideTwentyFive: {
        url: null
      }
    }),
    watch: {
      value (actual) {
        this.start(actual)
      },
      $route (to) {
        if (this.slideId === 1 && to.name === 'Settings') {
          this.showSlideTwo()
        } else if (this.slideId === 6 && to.name === 'Configuration Model') {
          this.showSlideSeven()
        } else if (this.slideId === 11 && to.name === 'Configuration') {
          this.showSlideTwelve()
        } else if (this.slideId === 21 && to.name === 'Settings') {
          this.showSlideTwentyTwo()
        }
      }
    },
    mounted () {
      this.onResize()
      this.$eventHub.$on('tutorialBaseModelClicked', this.showSlideThree)
      this.$eventHub.$on('tutorialBaseModelCreated', this.showSlideFive)
      this.$eventHub.$on('tutorialBaseModelCreatedNext', this.showSlideSix)
      this.$eventHub.$on('tutorialConfigurationModelCreated', this.showNextModelSlide)
      this.$eventHub.$on('tutorialConfigurationModelChanged', this.showModelSlide)
      this.$eventHub.$on('tutorialFirstBaseClicked', this.moveInnerRectToBase)
      this.$eventHub.$on('tutorialNextBaseClicked', this.showSlideFourteen)
      this.$eventHub.$on('tutorialAllFilled', this.showSlideFifteen)
      this.$eventHub.$on('tutorialConfigurationVariableAdded', this.showSlideEighteen)
      this.$eventHub.$on('tutorialEditMode', this.showSlideTwenty)
      this.$eventHub.$on('tutorialConfigurationSaved', this.showSlideTwentyOne)
      this.$eventHub.$on('tutorialRestConfigurationClicked', this.showSlideTwentyThree)
      this.$eventHub.$on('tutorialAddConfigurationURL', this.showSlideTwentyFive)

      if (this.value) {
        this.start(true)
      }
    },
    methods: {
      start (actual) {
        if (actual === true) {
          // this.$router.push('/settings')
          // this.$anime({
          //   targets: this.fill,
          //   duration: 1000,
          //   opacity: 0.9,
          //   easing: 'linear',
          //   complete: () => {
          //     this.showSlideTwentyTwo()
          //   }
          // })
          this.$router.push('/configuration')
          this.$anime({
            targets: this.fill,
            duration: 1000,
            opacity: 0.9,
            easing: 'linear',
            complete: () => {
              this.showSlideOne()
              this.showSettings()
            }
          })
        }
      },
      moveInnerRectToBase () {
        const element = document.getElementById(`baseConf_${this.lastBaseModel}`)

        if (element) {
          const rect = element.getBoundingClientRect()
          this.$anime({
            targets: this.innerRect,
            duration: 500,
            delay: 0,
            easing: 'linear',
            x: rect.left - 50,
            y: rect.top + 90
          })
        }
      },
      onResize () {
        this.windowSize = { x: window.innerWidth, y: window.innerHeight }
      },
      showSettings () {
        if (this.value === false) {
          return
        }
        const rect = document.getElementById('settingsMenu').getBoundingClientRect()

        const middleX = rect.left + (rect.width / 2)
        const middleY = rect.top + (rect.height / 2)

        this.slideOne.settingsTop = middleY - 50

        this.$anime({
          targets: this.innerRect,
          delay: 6000,
          duration: 1000,
          easing: 'linear',
          x: [middleX, rect.left],
          y: [middleY, rect.top],
          v: rect.height,
          h: rect.width
        })
      },
      showSlideOne () {
        if (this.value === false) {
          return
        }
        this.slideId = 1

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: 1,
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideTwo () {
        if (this.value === false) {
          return
        }
        this.slideId = 2

        setTimeout(() => {
          const rect = document.getElementById('baseModelTab').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideTwo.baseModelsLeft = middleX
          this.slideTwo.baseModelsTop = rect.top + rect.height

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 1000,
            easing: 'linear',
            x: [middleX, rect.left],
            y: [middleY, rect.top],
            v: [0, rect.height],
            h: [0, rect.width]
          })
        }, 1000)

        this.$anime({
          targets: this.innerRect,
          duration: 500,
          delay: 0,
          easing: 'linear',
          v: 0,
          h: 0
        })

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(3000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideThree () {
        if (this.value === false) {
          return
        }
        this.slideId = 3

        this.$anime({
          targets: this.innerRect,
          duration: 500,
          easing: 'linear',
          v: 0,
          h: 0
        })

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideFour () {
        if (this.value === false) {
          return
        }
        this.slideId = 4

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })

        const rect = document.getElementById('baseModelInput').getBoundingClientRect()

        const middleX = rect.left + (rect.width / 2)
        const middleY = rect.top + (rect.height / 2)

        this.slideFour.baseModelsLeft = middleX
        this.slideFour.baseModelsTop = rect.top
        this.slideFour.baseModelsBottom = rect.top + rect.height
        this.slideFour.baseModelsRight = rect.left + rect.width

        this.$anime({
          targets: this.innerRect,
          duration: 1000,
          delay: 2000,
          easing: 'linear',
          x: [middleX, rect.left - 50],
          y: [middleY, rect.top - 8],
          v: [0, rect.height + 16],
          h: [0, rect.width + 100]
        })
      },
      showSlideFive () {
        if (this.value === false) {
          return
        }
        this.slideId = 5

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          let rect = document.getElementById('base_0').getBoundingClientRect()

          // let middleX = rect.left + (rect.width / 2)
          // let middleY = rect.top + (rect.height / 2)

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 100,
            easing: 'linear',
            x: rect.left + 100,
            y: rect.top,
            v: rect.height,
            h: rect.width - 160
          })

          setTimeout(() => {
            const rect2 = document.getElementById('baseModelInput').getBoundingClientRect()

            this.$anime({
              targets: this.innerRect,
              duration: 1000,
              easing: 'linear',
              x: rect2.left - 50,
              y: rect2.top - 8,
              v: rect2.height + 16,
              h: rect2.width + 100
            })
          }, 6000)
        })
      },
      showSlideSix () {
        if (this.value === false || this.slideId === 6) {
          return
        }

        this.slideId = 6

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById('menuBase_0').getBoundingClientRect()

          this.secondInnerRect.x = rect.left
          this.secondInnerRect.y = rect.top

          this.slideSix.baseModelsLeft = rect.left + rect.width + 10
          this.slideSix.baseModelsTop = rect.top

          this.$anime({
            targets: this.secondInnerRect,
            delay: 2000,
            duration: 1000,
            easing: 'easeInOutSine',
            v: rect.height,
            h: rect.width
          })
        })
      },
      showSlideSeven () {
        if (this.value === false || this.slideId === 7) {
          return
        }

        this.slideId = 7

        this.$nextTick(() => {
          this.secondInnerRect = {
            x: 0,
            y: 0,
            v: 0,
            h: 0
          }
          this.innerRect = {
            x: 0,
            y: 0,
            v: 0,
            h: 0
          }

          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideEight () {
        if (this.value === false || this.slideId === 8) {
          return
        }

        this.slideId = 8

        this.$nextTick(() => {
          const rect = document.getElementById('modelSelect').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideEight.baseModelsLeft = middleX
          this.slideEight.baseModelsTop = rect.top
          this.slideEight.baseModelsBottom = rect.top + rect.height
          this.slideEight.baseModelsRight = rect.left + rect.width

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 1000,
            easing: 'linear',
            x: [middleX, rect.left - 50],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 20],
            h: [0, rect.width + 100]
          })

          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showModelSlide (sequenceNumber) {
        if (sequenceNumber > 0) {
          this.showSlideTen()
        } else {
          this.lastBaseModel++
        }
      },
      showNextModelSlide () {
        this.showSlideNine()
      },
      showSlideNine () {
        if (this.value === false || this.slideId === 9) {
          return
        }

        this.slideId = 9

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const menu = document.getElementById(`menuBase_${this.lastBaseModel}`)
          if (menu === null) {
            this.showSlideEleven()
            return
          }
          const rect = menu.getBoundingClientRect()

          this.slideNine.baseModelsLeft = 0
          this.slideNine.baseModelsTop = rect.top

          this.secondInnerRect.x = rect.left
          this.secondInnerRect.y = rect.top

          this.$anime({
            targets: this.secondInnerRect,
            delay: 4000,
            duration: 1000,
            easing: 'easeInOutSine',
            v: rect.height,
            h: rect.width
          })
        })
      },
      showSlideTen () {
        if (this.value === false || this.slideId === 10) {
          return
        }

        this.slideId = 10

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          const menu = document.getElementById(`menuBase_${this.lastBaseModel}`)
          if (menu === null) {
            this.showSlideEleven()
            return
          }

          const menuRect = menu.getBoundingClientRect()

          this.$anime({
            targets: this.secondInnerRect,
            delay: 4000,
            duration: 1000,
            easing: 'easeInOutSine',
            x: menuRect.left,
            y: menuRect.top
          })

          this.lastBaseModel++

          const rect = document.getElementById('modelSelect').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideEight.baseModelsLeft = middleX
          this.slideEight.baseModelsTop = rect.top
          this.slideEight.baseModelsBottom = rect.top + rect.height
          this.slideEight.baseModelsRight = rect.left + rect.width

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 1000,
            easing: 'linear',
            x: [middleX, rect.left - 50],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 20],
            h: [0, rect.width + 100]
          })

          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideEleven () {
        if (this.value === false || this.slideId === 11) {
          return
        }

        this.slideId = 11

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById('Configuration_id').getBoundingClientRect()

          this.slideEleven.baseModelsLeft = rect.x
          this.slideEleven.baseModelsTop = rect.y

          this.innerRect.x = rect.x
          this.innerRect.y = rect.y

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 6000,
            easing: 'linear',
            v: [0, rect.height],
            h: [0, rect.width]
          })
        })
      },
      showSlideTwelve () {
        if (this.value === false || this.slideId === 12) {
          return
        }

        this.slideId = 12

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideThirteen () {
        if (this.value === false || this.slideId === 13) {
          return
        }

        this.lastBaseModel = 0
        this.slideId = 13

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById('baseConf_0').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 4000,
            easing: 'linear',
            x: [middleX, rect.left - 50],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 20],
            h: [0, rect.width + 100]
          })
        })
      },
      showSlideFourteen () {
        if (this.value === false) {
          return
        }

        this.lastBaseModel++
        this.slideId = 14

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById(`baseConf_${this.lastBaseModel}`).getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 4000,
            easing: 'linear',
            x: [middleX, rect.left - 50],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 20],
            h: [0, rect.width + 100]
          })
        })
      },
      showSlideFifteen (baseValues) {
        if (this.value === false || this.slideId === 15) {
          return
        }

        this.baseItems = []
        for (let key in baseValues) {
          this.baseItems.push(key)
        }

        this.bases = Object.assign({}, baseValues)
        this.slideId = 15

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideSixteen () {
        if (this.value === false || this.slideId === 16) {
          return
        }

        this.slideId = 16

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideSeventeen () {
        if (this.value === false || this.slideId === 17) {
          return
        }

        this.slideId = 17

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById(`newConfigurationRow`).getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideSeventeen.svgTop = rect.top
          this.slideSeventeen.svgLeft = rect.left + 150
          this.slideSeventeen.svgRight = rect.right - 50

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 2000,
            easing: 'linear',
            x: [middleX, rect.left],
            y: [middleY, rect.top],
            v: [0, rect.height],
            h: [0, rect.width]
          })
        })
      },
      showSlideEighteen (variableCount) {
        if (this.value === false) {
          return
        }

        this.slideId = 18

        if (variableCount > 1) {
          this.showSlideNineteen()
          return
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById(`newConfigurationRow`).getBoundingClientRect()

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 200,
            easing: 'linear',
            x: rect.left,
            y: rect.top
          })
        })
      },
      showSlideNineteen () {
        if (this.value === false || this.slideId === 19) {
          return
        }

        this.slideId = 19

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById(`modeSwitchId`).getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideNineteen.svgTop = rect.top - 10
          this.slideNineteen.svgRight = rect.right - 50

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 6000,
            easing: 'linear',
            x: [middleX, rect.left - 10],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 20],
            h: [0, rect.width + 20]
          })
        })
      },
      showSlideTwenty () {
        if (this.value === false || this.slideId === 20) {
          return
        }

        this.slideId = 20

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          setTimeout(() => {
            const rect = document.getElementById(`configurationPanelId`).getBoundingClientRect()

            const middleX = rect.left + (rect.width / 2)
            const middleY = rect.top + (rect.height / 2)

            this.$anime({
              targets: this.innerRect,
              duration: 1000,
              delay: 0,
              easing: 'linear',
              x: [middleX, rect.left - 10],
              y: [middleY, rect.top - 10],
              v: [0, rect.height + 20],
              h: [0, rect.width + 20]
            })

            const rect2 = document.getElementById(`saveConfigurationButton`).getBoundingClientRect()

            const middleX2 = rect2.left + (rect2.width / 2)
            const middleY2 = rect2.top + (rect2.height / 2)

            this.$anime({
              targets: this.secondInnerRect,
              duration: 1000,
              delay: 0,
              easing: 'linear',
              x: [middleX2, rect2.left],
              y: [middleY2, rect2.top],
              v: [0, rect2.height],
              h: [0, rect2.width]
            })
          }, 2000)
        })
      },
      showSlideTwentyOne () {
        if (this.value === false || this.slideId === 21) {
          return
        }

        this.slideId = 21

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }
        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById('settingsMenu').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideOne.settingsTop = middleY - 50

          this.$anime({
            targets: this.innerRect,
            delay: 6000,
            duration: 1000,
            easing: 'linear',
            x: [middleX, rect.left],
            y: [middleY, rect.top],
            v: rect.height,
            h: rect.width
          })
        })
      },
      showSlideTwentyTwo () {
        if (this.value === false || this.slideId === 22) {
          return
        }

        this.slideId = 22

        this.secondInnerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }
        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }
        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          setTimeout(() => {
            const rect = document.getElementById('restTab').getBoundingClientRect()

            const middleX = rect.left + (rect.width / 2)
            const middleY = rect.top + (rect.height / 2)

            this.slideTwentyTwo.restLeft = middleX
            this.slideTwentyTwo.restTop = rect.top + rect.height

            this.$anime({
              targets: this.innerRect,
              duration: 1000,
              delay: 1000,
              easing: 'linear',
              x: [middleX, rect.left],
              y: [middleY, rect.top],
              v: [0, rect.height],
              h: [0, rect.width]
            })
          }, 2000)
        })
      },
      showSlideTwentyThree () {
        if (this.value === false || this.slideId === 23) {
          return
        }

        this.slideId = 23

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      },
      showSlideTwentyFour () {
        if (this.value === false || this.slideId === 24) {
          return
        }

        this.slideId = 24

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })

          const rect = document.getElementById('restUrlInputId').getBoundingClientRect()

          const middleX = rect.left + (rect.width / 2)
          const middleY = rect.top + (rect.height / 2)

          this.slideTwentyFour.inputTop = rect.top
          this.slideTwentyFour.inputLeft = rect.left
          this.slideTwentyFour.inputRight = rect.right

          this.$anime({
            targets: this.innerRect,
            duration: 1000,
            delay: 2000,
            easing: 'linear',
            x: [middleX, rect.left - 40],
            y: [middleY, rect.top - 10],
            v: [0, rect.height + 35],
            h: [0, rect.width + 80]
          })
        })
      },
      showSlideTwentyFive (url) {
        if (this.value === false || this.slideId === 25) {
          return
        }

        this.slideId = 25

        this.innerRect = {
          x: 0,
          y: 0,
          v: 0,
          h: 0
        }

        const start = '<span style="color:#f2a52a" class="font-weight-bold">'
        const end = '</span>'

        for (let key of Object.getOwnPropertyNames(this.bases)) {
          const base = this.bases[key]
          if (base) {
            url = url.replace(`{${base.base}}`, `${start}${base.name}${end}`)
          }
        }

        this.slideTwentyFive.url = "Now you're able to obtain your configuration using " +
          'previously configured URL<br><br>'
        this.slideTwentyFive.url += `curl -u username:password ${window.location.protocol}//${window.location.host}/v1/`
        this.slideTwentyFive.url += `${url}`

        this.$nextTick(() => {
          this.$anime({
            targets: '.slide',
            opacity: [0, 1],
            delay: this.$anime.stagger(2000, { start: 500 }),
            duration: 1000,
            easing: 'easeInOutSine'
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
