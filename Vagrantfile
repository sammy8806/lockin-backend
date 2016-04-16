Vagrant.configure(2) do |config|

    config.vm.box = "williamyeh/ubuntu-trusty64-docker"
    config.vm.box_check_update = true

    config.vm.post_up_message = "Server is online!"

    config.vm.provider "virtualbox" do |vb|
        vb.memory = 512

        ## Enable this to get an interactive VirtualBox GUI
        # vb.gui = true
    end

    config.vm.synced_folder ".", "/srv/server/", create: true

    config.vm.provision :docker
    config.vm.provision :docker_compose, yml: "/srv/server/docker-compose.yml", rebuild: true, run: "always"

end
