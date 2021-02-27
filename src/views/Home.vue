<template>
  <div class="home container flex flex-col">
    <div
      id="top"
      class="bg-white font-semibold rounded-2xl h-screen flex flex-col items-center justify-center text-center no-print"
    >
      <p class="text-4xl text-pink-400 mx-4 sm:mx-0">
        My friends know me as the
      </p>
      <TypeText
        class="ml-3 text-indigo-500"
        :words="['Polyglot', 'Enthusiast', 'Brainstormer', 'Schumacher fan']"
      />
    </div>

    <section
      id="introduction"
      class="flex flex-col md:flex-row items-center justify-center mb-10"
      @click="setAnchor('introduction')"
    >
      <h1 class="text-red-500 text-4xl py-4 font-bold md:mr-10">
        Hi! I'm Martin
      </h1>

      <img
        class="rounded-full portrait"
        style="width: 330px; height: 330px"
        alt="Portrait"
        src="../assets/portrait.jpeg"
      />
    </section>

    <div
      class="text-xl px-0 sm:px-10 rounded-2xl bg-yellow-50 bg-opacity-20 w-full lg:w-2/3 ml-auto mr-auto"
    >
      <section
        class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide leading-7 py-10 px-10 sm:px-20"
      >
        <p>
          23 years old, born and raised in a small town called Munkebo in
          Denmark.
        </p>

        <p>
          As a programming enthusiast that has been lucky enough, to do the job
          professionally for the past ~3 years.
        </p>
        <p>While being employed by vastly different companies.</p>
        <br />
        <p>
          In 2017 i started on a vocational education called
          <i>Datatechnician specializing in programming</i> at
          <a
            class="text-blue-600 hover:text-blue-300"
            href="https://sde.dk"
            target="_blank"
            rel="noopener nofollow"
            >Syddansk Erhvervsskole Odense-Vejle</a
          >.
        </p>
        <p>
          It's a 5 year long education, done in 5 ten week semesters then
          followed by apprenticeship work in between.
        </p>
      </section>
    </div>

    <h2
      id="career"
      class="text-5xl md:py-4 text-center md:text-left font-bold mt-20 mb-10"
    >
      Career
    </h2>

    <div
      class="text-xl px-0 sm:px-10 py-2 rounded-2xl bg-yellow-50 bg-opacity-10"
    >
      <section class="pt-4 pb-4 py-10 px-10 sm:px-20">
        <div class="divide-y-2 divide-indigo-400 divide-opacity-30">
          <div class="mb-3">
            <h3 class="text-2xl font-black text-red-500">evercall</h3>
            <h4 class="text-xl pb-2 text-gray-600">Jun 2020 - Current</h4>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Here i'm primarily working on a SIP Softphone application, which
              is written in react and wrapped in Electron.
            </p>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Telephony is an overlooked industry, at least when you search
              GitHub for related projects, besides from the major players like
              Asterisk, FreeSwitch and Kamalio.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              The upside of it is, that the tasks gets pretty interesting, as
              there are new problems you can't easily find an answer for, when
              scouring StackOverflow.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              All of us developers partake in customer support over the phone.
              This is the first time i've done direct support and i must say
              that, not only have i bettered my social skills. But most
              importantly we get direct feedback on how the software we make,
              has an impact on people.
            </p>
          </div>

          <div class="py-4">
            <h3 class="text-2xl font-black text-red-500">SiteTech</h3>
            <h4 class="text-xl pb-2 text-gray-600">Jul 2018 - Mar 2020</h4>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Here i started out writing a node console app, that traded with
              digital currencies - based on traditional technical analysis and a
              custom sentiment analyzer i made for gauging interest on Twitter.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              This project was what kickstarted my professional career, as we
              got a project from Jysk Fynske Medier (major news publisher in
              Denmark), to make a platform called
              <a href="https://ugeavisen.dk/e-profil/" rel="noopener nofollow"
                >E-Profil</a
              >
              for their advertisers to list themselves.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              As the lead on the project, i wrote the backend and data importers
              in Laravel. While mentoring my colleague on the Vue.js frontend.
            </p>

            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              I analyzed and implemented the infrastructure on AWS, using
              Terraform for easily bringing environments up and down.
            </p>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Summarized the main components consist of: EC2, ECS, RDS Postgres,
              ElastiCache Redis, Cloudfront, Lambda, API Gateway. While the
              autoscaling is configured with Cloudwatch alarms.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Due to the Corona pandemic and spending, SiteTech sadly went
              defunct in January 2020.
            </p>
          </div>

          <div class="py-4">
            <h3 class="text-2xl font-black text-red-500">Odense Kommune</h3>
            <h4 class="text-xl pb-2 text-gray-600">Oct 2017 - Feb 2018</h4>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              At first i was employed at Odense Kommune (Odense Municipality) in
              their backend development department.
            </p>
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              Here i was tasked with creating a web dashboard, for managing
              whitelisting and user requests for
              <a
                href="https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/applocker/applocker-overview"
                target="_blank"
                rel="noopener nofollow"
                >Windows AppLocker</a
              >.
            </p>

            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              It was my first time creating an application with the .NET stack
              and introduced me to Angular.
            </p>
            <br />
            <p
              class="subpixel-antialiased leading-7 whitespace-pre-line font-light tracking-wide"
            >
              On the side i did some Ad Hoc tasks, creating scripts for text
              replacement in OpenDoc/MS Word and bugfixing AutoHotKey scripts
              that are used by caseworkers for scraping internal systems.
            </p>
          </div>
        </div>
      </section>
    </div>

    <h3
      id="education"
      class="text-5xl md:py-4 text-center md:text-left font-bold mt-20 mb-10"
    >
      Education
    </h3>

    <div
      class="text-xl px-0 sm:px-10 py-2 rounded-2xl bg-yellow-50 bg-opacity-10"
    >
      <section class="pt-4 pb-4 py-10 px-10 sm:px-20">
        <div class="divide-y-2 divide-indigo-400 divide-opacity-30">
          <div class="mb-3">
            <h3 class="text-2xl font-black text-red-500">
              Datatechnician specializing in programming
            </h3>
            <h4 class="text-xl pb-2 text-gray-600">2017-2022</h4>
            <h6 class="text-xl pb-2 text-gray-600">
              Syddansk Erhvervsskole Odense-Vejle
            </h6>
            <p class="text-xl pb-2 text-gray-600 italic">Vocational</p>
          </div>

          <div class="py-4">
            <h3 class="text-2xl font-black text-red-500">Web-Integrator</h3>
            <h4 class="text-xl pb-2 text-gray-600">2015-2016</h4>
            <h6 class="text-xl pb-2 text-gray-600">
              Syddansk Erhvervsskole Odense-Vejle
            </h6>
            <p class="text-xl pb-2 text-gray-600 italic">Vocational</p>
          </div>
        </div>
      </section>
    </div>

    <AnchorScroll :anchors="['top', 'introduction', 'career', 'education']" />
  </div>
</template>

<script>
import TypeText from "@/components/TypeText";
import AnchorScroll from "@/components/AnchorScroll";

export default {
  name: "Home",
  components: {
    AnchorScroll,
    TypeText,
  },
  methods: {
    /**
     * @param {string} id
     */
    setAnchor(id) {
      this.$router.currentRoute.hash = id;
    },
  },
  mounted() {
    document.title = "Juul";
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", "Martin Juul is a software developer");
  },
};
</script>

<style scoped>
.portrait {
  border: double 8px transparent;
  border-radius: 100%;
  background-image: linear-gradient(#ffffff, #ffffff),
    linear-gradient(270deg, #00c5d7, #b95dd7 50%, #ffb367 100%);
  background-clip: content-box, border-box;
  background-repeat: no-repeat;
  background-size: 100% 100%, 100% 200%;
  background-position: 0 0, 0 100%;
  background-origin: padding-box, border-box;
  animation: highlight 1s infinite alternate;
}

@keyframes highlight {
  100% {
    background-position: 0 0, 0 0;
  }
}
</style>
